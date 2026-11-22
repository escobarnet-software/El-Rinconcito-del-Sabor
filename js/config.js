/* =====================================================================
   CONFIGURACIÓN DE EL RINCONCITO DEL SABOR
   Todo lo que el restaurante puede cambiar está aquí. Después de editar:
   1. Guarda este archivo.
   2. (Opcional, para la versión sin JavaScript y para Google) corre
      `node tools/render.mjs` para actualizar el menú dentro de index.html.
   ===================================================================== */
window.RINCONCITO = {
  nombre: 'El Rinconcito del Sabor',

  // Número de WhatsApp solo con dígitos: código de país (503) + número.
  whatsapp: '50375311377',
  whatsappVisible: '+503 7531-1377',

  // HORARIO DE EJEMPLO (tomado de Tripadvisor, sin confirmar con el restaurante).
  // 0 = domingo, 1 = lunes ... 6 = sábado. Formato 24 h. [] = cerrado ese día.
  // Puede tener dos turnos: [['12:00','15:00'], ['18:00','22:00']]
  horarioEsDeEjemplo: true,
  zonaHoraria: 'America/El_Salvador',
  horario: {
    1: [['12:00', '22:00']],
    2: [['12:00', '22:00']],
    3: [['12:00', '22:00']],
    4: [['12:00', '22:00']],
    5: [['12:00', '22:00']],
    6: [['12:00', '22:00']],
    0: [['12:00', '22:00']],
  },

  // Pedidos para llevar
  minutosPreparacion: 30,   // la primera hora de recogida es ahora + esto
  intervaloRecogida: 15,    // minutos entre opciones de hora
  ultimoPedidoAntesDeCerrar: 15, // no se recoge en los últimos N minutos
  maximoPorPlatillo: 30,

  moneda: '$',

  // MENÚ: tomado del catálogo de WhatsApp Business del restaurante (nov. 2026).
  // Precios por confirmar. foto = archivo en img/menu/
  categorias: [
    { id: 'parrilla', nombre: 'Parrilla y platos fuertes', platillos: [
      { id: 'parrillada-2', nombre: 'Parrillada para 2 personas', descripcion: 'Para compartir.', precio: 19.00, foto: 'parrillada-2' },
      { id: 'plato-mixto', nombre: 'Plato mixto típico', descripcion: 'Combinación de filete con acompañamientos típicos.', precio: 12.95, foto: 'plato-mixto' },
      { id: 'pescado-frito', nombre: 'Pescado frito', descripcion: 'Róbalo frito con sus acompañamientos.', precio: 10.00, foto: 'pescado-frito' },
      { id: 'lomito-tipico', nombre: 'Lomito típico', descripcion: 'Lomito con acompañamientos típicos.', precio: 8.99, foto: 'lomito-tipico' },
      { id: 'lomito-parrilla', nombre: 'Lomito a la parrilla', descripcion: 'Lomito a la parrilla con sus acompañamientos.', precio: 8.50, foto: 'lomito-parrilla' },
      { id: 'pechuga-champinones', nombre: 'Pechuga en salsa de champiñones', descripcion: '6 onzas de pechuga bañada en salsa de champiñones.', precio: 8.50, foto: 'pechuga-champinones' },
      { id: 'chicharrones', nombre: 'Chicharrones de carne', descripcion: 'Chicharrones de carne de la casa.', precio: 7.95, foto: 'chicharrones' },
      { id: 'pechuga-parrilla', nombre: 'Pechuga a la parrilla', descripcion: 'Filete de pechuga de 5 onzas.', precio: 7.50, foto: 'pechuga-parrilla' },
    ]},
    { id: 'mariscos', nombre: 'Mariscos', platillos: [
      { id: 'mar-y-tierra', nombre: 'Mar y tierra', descripcion: '5 camarones jumbo al ajillo y carne.', precio: 14.99, foto: 'mar-y-tierra' },
      { id: 'camarones-ajillo', nombre: 'Camarones al ajillo', descripcion: 'Camarones al ajillo con sus acompañamientos.', precio: 9.95, foto: 'camarones-ajillo' },
      { id: 'camarones-empanizados', nombre: 'Camarones empanizados', descripcion: 'Camarones empanizados de la casa.', precio: 9.95, foto: 'camarones-empanizados' },
      { id: 'coctel-rosada', nombre: 'Cóctel en salsa rosada', descripcion: '', precio: 6.00, foto: 'coctel-rosada' },
      { id: 'tacos-camaron', nombre: 'Tacos de camarón', descripcion: '3 tacos de camarón con queso.', precio: 5.25, foto: 'tacos-camaron' },
    ]},
    { id: 'antojitos', nombre: 'Tacos, tortas y antojitos', platillos: [
      { id: 'comal-mexicano', nombre: 'Comal mexicano', descripcion: 'Torta, burrito y más, para compartir.', precio: 26.95, foto: 'comal-mexicano' },
      { id: 'cazuela-alambre', nombre: 'Cazuela de tacos de alambre', descripcion: 'Perfecta para compartir.', precio: 18.99, foto: 'cazuela-alambre' },
      { id: 'taquiza-12', nombre: 'Taquiza de 12 tacos', descripcion: '12 tacos de carne.', precio: 15.95, foto: 'taquiza-12' },
      { id: 'nacho-familiar', nombre: 'Nacho familiar', descripcion: 'Nachos familiares para compartir.', precio: 9.00, foto: 'nacho-familiar' },
      { id: 'tacos-birria', nombre: 'Tacos de birria, 4 unidades', descripcion: 'La orden de 3 cuesta $5.50.', precio: 7.00, foto: 'tacos-birria' },
      { id: 'torta-birria', nombre: 'Torta de birria', descripcion: 'Delicia de la casa.', precio: 7.00, foto: 'torta-birria' },
      { id: 'alitas', nombre: 'Alitas búfalo o barbacoa', descripcion: 'Alitas fritas. Dinos la salsa en la nota.', precio: 6.00, foto: 'alitas' },
      { id: 'torta-res-pollo', nombre: 'Torta de res o pollo', descripcion: 'Torta rellena de la carne que escojas.', precio: 6.00, foto: 'torta-res-pollo' },
      { id: 'panini', nombre: 'Panini de pollo o res', descripcion: 'Fajitas de pollo con queso cheddar.', precio: 6.00, foto: 'panini' },
      { id: 'burrito', nombre: 'Burrito de res o pollo', descripcion: 'Burrito de carne de res o pollo.', precio: 5.75, foto: 'burrito' },
      { id: 'sopa-tortilla', nombre: 'Sopa de tortilla', descripcion: 'Sopa de tortilla de la casa.', precio: 5.75, foto: 'sopa-tortilla' },
      { id: 'tacos-res-pollo', nombre: 'Tacos de res o pollo, orden de 3', descripcion: 'Precio de la orden de pollo; la de res puede variar.', precio: 4.75, foto: 'tacos-res-pollo' },
      { id: 'nachos-patu-boca', nombre: 'Nachos Patu Boca', descripcion: 'Nachos con chili con carne y aguacate.', precio: 3.99, foto: 'nachos-patu-boca' },
    ]},
    { id: 'hamburguesas', nombre: 'Hamburguesas', platillos: [
      { id: 'duo-dinamico', nombre: 'Dúo dinámico', descripcion: '2 hamburguesas.', precio: 16.99, foto: 'duo-dinamico' },
      { id: 'tropical-camaron', nombre: 'Tropical de camarón', descripcion: 'Hamburguesa premium.', precio: 9.95, foto: 'tropical-camaron' },
      { id: 'suprema-tropical', nombre: 'Suprema tropical', descripcion: 'Hamburguesa de la casa.', precio: 9.95, foto: 'suprema-tropical' },
      { id: 'y-la-queso', nombre: 'Y la queso', descripcion: '2 carnes bañadas en queso cheddar.', precio: 9.95, foto: 'y-la-queso' },
      { id: 'hamburguesa-brava', nombre: 'Hamburguesa brava', descripcion: 'Hamburguesa de pollo bañada en salsa.', precio: 8.99, foto: 'hamburguesa-brava' },
      { id: 'la-grosera', nombre: 'La grosera', descripcion: '', precio: 8.00, foto: 'la-grosera' },
      { id: 'chiken-pikis', nombre: 'La Chiken Pikis', descripcion: 'Hamburguesa de pollo.', precio: 7.25, foto: 'chiken-pikis' },
      { id: 'traicionera', nombre: 'Traicionera', descripcion: 'Doble carne y doble queso.', precio: 7.00, foto: 'traicionera' },
      { id: 'la-gruta', nombre: 'La Gruta', descripcion: 'Hamburguesa de la casa.', precio: 6.75, foto: 'la-gruta' },
      { id: 'mi-rancho', nombre: 'Mi Rancho', descripcion: 'Hamburguesa de la casa.', precio: 6.75, foto: 'mi-rancho' },
      { id: 'pica-rico-chipotle', nombre: 'Pica Rico Chipotle', descripcion: 'Carne de res con salsa chipotle.', precio: 6.50, foto: 'pica-rico-chipotle' },
    ]},
    { id: 'bebidas', nombre: 'Bebidas y postre', platillos: [
      { id: 'pina-colada', nombre: 'Piña colada con licor', descripcion: 'Jugo de piña y coco.', precio: 4.25, foto: 'pina-colada' },
      { id: 'rosita-fresita', nombre: 'Rosita fresita', descripcion: 'Jugo de granadina y tequila.', precio: 4.25, foto: 'rosita-fresita' },
      { id: 'dulce-amanecer', nombre: 'Dulce amanecer', descripcion: 'Ron, jugo de naranja y vodka.', precio: 4.25, foto: 'dulce-amanecer' },
      { id: 'azulito', nombre: 'Azulito', descripcion: 'Tequila, jugo de naranja y soda.', precio: 4.00, foto: 'azulito' },
      { id: 'michelada-maracuya', nombre: 'Michelada de maracuyá', descripcion: '', precio: 4.00, foto: 'michelada-maracuya' },
      { id: 'cheesecake', nombre: 'Cheesecake de maracuyá, mora o fresa', descripcion: 'Incluye café. Dinos el sabor en la nota.', precio: 3.95, foto: 'cheesecake' },
    ]},
  ],
};
