import { Router } from 'express';
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js';
import { pool } from '../persistence/PostgreSQLConfig.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
import { Response } from 'express';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const router = Router();

// Registrar venta (efectivo o tarjeta)
router.post('/vender', verificarToken, verificarRol(['OWNER']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { items, metodo_pago } = req.body;
    const id_vendedor = req.usuario?.id_usuario;

    let total = 0;
    let ganancia = 0;

    for (const item of items) {
      const prod = await client.query(
        `SELECT * FROM productos WHERE id_producto = $1 AND activo = true`,
        [item.id_producto]
      );
      if (prod.rows.length === 0) throw new Error(`Producto ${item.id_producto} no encontrado.`);
      if (prod.rows[0].stock < item.cantidad) throw new Error(`Stock insuficiente para ${prod.rows[0].nombre}.`);

      total += prod.rows[0].precio_venta * item.cantidad;
      ganancia += (prod.rows[0].precio_venta - prod.rows[0].precio_costo) * item.cantidad;
    }

    const ventaResult = await client.query(
      `INSERT INTO ventas (id_vendedor, total, ganancia, metodo_pago) VALUES ($1, $2, $3, $4) RETURNING *`,
      [id_vendedor, total, ganancia, metodo_pago]
    );
    const id_venta = ventaResult.rows[0].id_venta;

    for (const item of items) {
      const prod = await client.query(`SELECT * FROM productos WHERE id_producto = $1`, [item.id_producto]);
      const p = prod.rows[0];
      await client.query(
        `INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, ganancia_unitaria)
         VALUES ($1, $2, $3, $4, $5)`,
        [id_venta, item.id_producto, item.cantidad, p.precio_venta, p.precio_venta - p.precio_costo]
      );
      await client.query(
        `UPDATE productos SET stock = stock - $1 WHERE id_producto = $2`,
        [item.cantidad, item.id_producto]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ mensaje: 'Venta registrada.', id_venta });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Generar link de Mercado Pago (token desde BD)
router.post('/mp-link', verificarToken, verificarRol(['OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const { items } = req.body;

    const configResult = await pool.query(
      `SELECT valor FROM configuracion WHERE clave = 'mp_access_token'`
    );
    const mpActivo = await pool.query(
      `SELECT valor FROM configuracion WHERE clave = 'mp_activo'`
    );

    if (mpActivo.rows[0]?.valor !== 'true') {
      res.status(400).json({ error: 'Mercado Pago no está configurado. Activalo en Configuración.' });
      return;
    }

    const token = configResult.rows[0]?.valor;
    if (!token) {
      res.status(400).json({ error: 'No hay un Access Token de Mercado Pago configurado.' });
      return;
    }

    const mpDynamic = new MercadoPagoConfig({ accessToken: token });
    const preference = new Preference(mpDynamic);

    const mpItems = await Promise.all(items.map(async (item: any) => {
      const prod = await pool.query(`SELECT * FROM productos WHERE id_producto = $1`, [item.id_producto]);
      const p = prod.rows[0];
      return {
        id: String(p.id_producto),
        title: p.nombre,
        quantity: item.cantidad,
        unit_price: Number(p.precio_venta),
        currency_id: 'ARS',
      };
    }));

    const result = await preference.create({
      body: {
        items: mpItems,
        back_urls: {
          success: `${process.env.FRONTEND_URL}/owner/punto-venta?mp=success`,
          failure: `${process.env.FRONTEND_URL}/owner/punto-venta?mp=failure`,
          pending: `${process.env.FRONTEND_URL}/owner/punto-venta?mp=pending`,
        },
        auto_return: 'approved',
      }
    });

    res.status(200).json({ checkout_url: result.init_point });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Historial de ventas del día
router.get('/historial', verificarToken, verificarRol(['OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT v.*, 
         json_agg(json_build_object(
           'nombre', p.nombre,
           'cantidad', dv.cantidad,
           'precio_unitario', dv.precio_unitario
         )) AS detalle
       FROM ventas v
       JOIN detalle_ventas dv ON dv.id_venta = v.id_venta
       JOIN productos p ON p.id_producto = dv.id_producto
       WHERE DATE(v.fecha) = CURRENT_DATE
       GROUP BY v.id_venta
       ORDER BY v.fecha DESC`
    );
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
// Estadísticas de ventas para el dashboard
router.get('/stats', verificarToken, verificarRol(['OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const hoy = await pool.query(`
      SELECT 
        COALESCE(SUM(total), 0) AS total_hoy,
        COALESCE(SUM(ganancia), 0) AS ganancia_hoy,
        COUNT(*) AS cantidad_hoy
      FROM ventas 
      WHERE DATE(fecha) = CURRENT_DATE
    `);

    const semana = await pool.query(`
      SELECT 
        COALESCE(SUM(total), 0) AS total_semana,
        COALESCE(SUM(ganancia), 0) AS ganancia_semana,
        COUNT(*) AS cantidad_semana
      FROM ventas 
      WHERE fecha >= DATE_TRUNC('week', CURRENT_DATE)
    `);

    const mes = await pool.query(`
      SELECT 
        COALESCE(SUM(total), 0) AS total_mes,
        COALESCE(SUM(ganancia), 0) AS ganancia_mes,
        COUNT(*) AS cantidad_mes
      FROM ventas 
      WHERE fecha >= DATE_TRUNC('month', CURRENT_DATE)
    `);

    const porMetodo = await pool.query(`
      SELECT 
        metodo_pago,
        COUNT(*) AS cantidad,
        COALESCE(SUM(total), 0) AS total
      FROM ventas
      WHERE fecha >= DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY metodo_pago
    `);

    const porDia = await pool.query(`
      SELECT 
        DATE(fecha) AS dia,
        COALESCE(SUM(total), 0) AS total,
        COALESCE(SUM(ganancia), 0) AS ganancia
      FROM ventas
      WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(fecha)
      ORDER BY dia ASC
    `);

    res.status(200).json({
      hoy: hoy.rows[0],
      semana: semana.rows[0],
      mes: mes.rows[0],
      por_metodo: porMetodo.rows,
      por_dia: porDia.rows,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;