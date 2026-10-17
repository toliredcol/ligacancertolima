
/*
# Módulos Educativos: Contenido Completo de los 6 Módulos

1. Cambios en `modules`
- Actualiza títulos exactos, descripciones, íconos PNG, colores hex y orden de los 6 módulos
- Renombra el slug 'cuello-uterino-asociados' a 'digestivas'

2. Cambios en `content_blocks`
- Elimina todos los bloques existentes para los 6 módulos
- Inserta bloques nuevos por módulo: secciones de texto, bloques de imagen vacíos (marcadores para imágenes subidas via admin), y galería de infografías al final

3. Cambios en `quiz_questions`
- Elimina preguntas existentes para los 6 módulos
- Inserta 3 preguntas por módulo (las mismas sirven para pre-test y post-test)

4. Cambios en `slider_images`
- Elimina slides existentes y agrega 4 slides nuevos con imágenes de prevención del cáncer

5. Notas
- Bloques de imagen creados vacíos; admin agrega imágenes desde el panel AdminImages/AdminModules
- La galería de infografías se identifica por el título 'Galería de Infografías'
- El slug 'cuello-uterino-asociados' se renombra a 'digestivas' de forma idempotente
*/

-- ================================================
-- ACTUALIZAR MÓDULOS
-- ================================================

UPDATE modules SET
  title = 'Cáncer de Cuello Uterino y Cánceres Asociados al VPH',
  description = 'El Virus del Papiloma Humano (VPH) es una infección prevenible y está relacionado con el 4,5% de los cánceres en el mundo. Además, entre el 90% y el 99% de los casos de cáncer de cuello uterino se deben a una infección persistente por este virus, especialmente por los tipos 16 y 18 de alto riesgo. Sin embargo, la buena noticia es que la vacunación y la detección temprana pueden reducir significativamente estos riesgos.',
  color = '#b916b8',
  icon = 'cancervphicono.png',
  order_index = 0
WHERE slug = 'vph';

UPDATE modules SET
  title = 'Control del Tabaco',
  description = 'Según el Ministerio de Salud, cada día cerca de 96 colombianos mueren por enfermedades directamente causadas por el tabaco, costando más de 17 billones de pesos anuales para el sistema de salud. A nivel global, el tabaquismo mata a más de 8 millones de personas al año, siendo el principal factor de riesgo del cáncer de pulmón: aproximadamente el 85% de los casos están directamente asociados al consumo de tabaco.',
  color = '#05b507',
  icon = 'cancertabacoicono.png',
  order_index = 1
WHERE slug = 'antitabaco';

UPDATE modules SET
  title = 'Cáncer de Próstata',
  description = 'El cáncer de próstata es una de las enfermedades más comunes en hombres, especialmente a medida que envejecen. La buena noticia es que detectarlo a tiempo puede hacer una gran diferencia en el tratamiento y recuperación. Conocer los factores de riesgo y las opciones de detección temprana es fundamental para proteger tu salud.',
  color = '#1088bc',
  icon = 'cancerprostataicono.png',
  order_index = 2
WHERE slug = 'prostata';

UPDATE modules SET
  title = 'Cáncer de Piel',
  description = 'El cáncer de piel es el tipo de cáncer más frecuente en todo el mundo. Aunque es prevenible, requiere de un enfoque integral que combine protección solar, autoexamen regular y detección temprana. Conocer los factores de riesgo y aprender a identificar cambios en tu piel puede salvar tu vida.',
  color = '#ff7d45',
  icon = 'cancerpielicono.png',
  order_index = 3
WHERE slug = 'piel';

UPDATE modules SET
  title = 'Cáncer de Mama',
  description = 'El cáncer de mama es el tipo de cáncer más común en el mundo y la principal causa de muerte por esta enfermedad en mujeres. Sin embargo, hay una gran noticia: un diagnóstico a tiempo puede cambiarlo todo, aumentando las posibilidades de recuperación hasta en un 90%. En el año 2022, se presentaron más de 2.3 millones de nuevos casos en el mundo.',
  color = '#ff4582',
  icon = 'cancermamaicono.png',
  order_index = 4
WHERE slug = 'mama';

UPDATE modules SET
  slug = 'digestivas',
  title = 'Vías Digestivas (Colon, Recto y Gástrico)',
  description = 'Los cánceres de las vías digestivas (colon, recto y estómago) representan una amenaza importante para la salud pública. Sin embargo, muchos de estos cánceres son prevenibles o tratables si se detectan a tiempo. Conocer los factores de riesgo, reconocer los síntomas de alerta y realizarse pruebas de detección temprana puede hacer una diferencia significativa en el resultado del tratamiento.',
  color = '#c91705',
  icon = 'cancercolonicono.png',
  order_index = 5
WHERE slug IN ('cuello-uterino-asociados', 'digestivas');

-- ================================================
-- LIMPIAR CONTENIDO EXISTENTE
-- ================================================

DELETE FROM content_blocks WHERE module_id IN (
  SELECT id FROM modules WHERE slug IN ('vph','antitabaco','prostata','piel','mama','digestivas')
);

DELETE FROM quiz_questions WHERE module_id IN (
  SELECT id FROM modules WHERE slug IN ('vph','antitabaco','prostata','piel','mama','digestivas')
);

-- ================================================
-- MÓDULO 1: VPH
-- ================================================

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', '¿Qué es el VPH?',
  '{"paragraphs":["El VPH (Virus del Papiloma Humano) es una infección muy común. Muchas veces no tiene síntomas, pero puede causar cáncer.","Hay varios tipos de VPH, algunos de bajo riesgo y otros de alto riesgo. Los tipos 16 y 18 son responsables de la mayoría de los cánceres asociados al VPH.","El virus se transmite principalmente por contacto sexual. La mayoría de las personas sexualmente activas estarán expuestas al VPH en algún momento de sus vidas. Sin embargo, la mayoría de las infecciones desaparecen naturalmente sin causar problemas de salud."]}'::jsonb, 0
FROM modules WHERE slug = 'vph';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - ¿Qué es el VPH?', '{"images":[]}'::jsonb, 1
FROM modules WHERE slug = 'vph';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', 'Hay vacuna contra el VPH',
  '{"paragraphs":["La vacuna es gratis y ayuda a prevenir varios tipos de cáncer. Está dirigida a niños, niñas y adolescentes de 9 a 17 años.","La vacuna contra el VPH salva vidas, es segura, gratuita y eficaz, y puede prevenir hasta el 90% de los cánceres asociados a este virus.","Por eso, médicos y pediatras recomiendan vacunar a niños y niñas desde los 9 años, protegiéndolos no solo en el presente, sino también en su bienestar futuro."]}'::jsonb, 2
FROM modules WHERE slug = 'vph';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Vacuna contra el VPH', '{"images":[]}'::jsonb, 3
FROM modules WHERE slug = 'vph';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', '¿Por qué es importante vacunarse?',
  '{"paragraphs":["Vacunarse a tiempo protege la salud y reduce el riesgo de enfermedades en el futuro.","El VPH puede afectar a hombres y mujeres. No solo causa cáncer de cuello uterino. También puede causar cáncer de: ano, garganta, pene, vagina y vulva.","La vacuna es segura y recomendada por expertos en salud. Protege el futuro de tus hijos."]}'::jsonb, 4
FROM modules WHERE slug = 'vph';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Importancia de la Vacuna', '{"images":[]}'::jsonb, 5
FROM modules WHERE slug = 'vph';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', 'Detección Temprana - Cuida tu salud',
  '{"paragraphs":["Hacerte las pruebas de detección a tiempo ayuda a encontrar cambios o lesiones antes de que se conviertan en cáncer de cuello uterino.","✔ Si tienes entre 25 y 29 años: Debes hacerte la citología cervical de forma regular.","✔ Si tienes entre 30 y 50 años en zona rural: Puedes hacerte la prueba VIA-VILI. Es rápida, sencilla y da resultados en la misma cita.","✔ Si tienes más de 30 años: Puedes hacerte la prueba ADN-VPH. En Colombia es gratuita y ayuda a detectar a tiempo el riesgo de cáncer.","Hacerte las pruebas a tiempo puede salvar tu vida. Revisar tus resultados y seguir las indicaciones médicas es fundamental."]}'::jsonb, 6
FROM modules WHERE slug = 'vph';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Detección Temprana VPH', '{"images":[]}'::jsonb, 7
FROM modules WHERE slug = 'vph';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Galería de Infografías', '{"images":[]}'::jsonb, 8
FROM modules WHERE slug = 'vph';

-- ================================================
-- MÓDULO 2: TABACO
-- ================================================

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', '¿Qué son los vapeadores?',
  '{"paragraphs":["Los vapeadores o cigarrillos electrónicos son dispositivos que calientan un líquido para generar un aerosol que se inhala. Aunque muchas personas creen que solo producen vapor, en realidad ese aerosol contiene diversas sustancias que pueden afectar la salud.","El líquido utilizado en los vapeadores suele contener nicotina, sustancias químicas perjudiciales, sustancias tóxicas como formaldehído, benceno, metales pesados, glicerina, propilenglicol y saborizantes que hacen más atractivo el consumo, especialmente entre los jóvenes.","En Colombia, aproximadamente 1,1 millones de personas han usado vapeadores y la mayoría de estos usuarios tiene entre 12 y 24 años."]}'::jsonb, 0
FROM modules WHERE slug = 'antitabaco';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Vapeadores', '{"images":[]}'::jsonb, 1
FROM modules WHERE slug = 'antitabaco';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', '¿Por qué son tan populares?',
  '{"paragraphs":["Muchos vapeadores se comercializan con sabores atractivos, colores llamativos y diseños modernos. Estas características han favorecido su popularidad, especialmente entre adolescentes y jóvenes.","Entre el 20% y el 35% de los jóvenes han comenzado a consumir por presión o influencia de su círculo cercano. En cerebros en desarrollo, la nicotina genera dependencia rápida y puede afectar la memoria, la concentración y la regulación emocional.","Los vapeadores no son una alternativa segura a los cigarrillos convencionales; son otra forma de exposición al riesgo."]}'::jsonb, 2
FROM modules WHERE slug = 'antitabaco';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Popularidad de Vapeadores', '{"images":[]}'::jsonb, 3
FROM modules WHERE slug = 'antitabaco';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', '¿Cómo afecta la nicotina?',
  '{"paragraphs":["La nicotina actúa directamente sobre el cerebro, especialmente durante la adolescencia, cuando aún está en desarrollo. Genera dependencia rápidamente, afecta el desarrollo normal del cerebro y hace que dejar de vapear sea más difícil.","El consumo de vapeadores y productos con nicotina puede producir adicción, daño pulmonar, irritación de ojos, garganta y vías respiratorias, mayor riesgo de enfermedades respiratorias y cardiovasculares, y mayor riesgo de cáncer.","Además, en Colombia 34.800 personas murieron el año pasado por causas relacionadas con el tabaco, una cifra comparable a que desapareciera una ciudad como Zipaquirá."]}'::jsonb, 4
FROM modules WHERE slug = 'antitabaco';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Efectos de la Nicotina', '{"images":[]}'::jsonb, 5
FROM modules WHERE slug = 'antitabaco';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', 'El humo también afecta a otras personas',
  '{"paragraphs":["El consumo de cigarrillos y vapeadores no solo perjudica a quien los usa. Cada año, alrededor de 1.300.000 personas mueren en el mundo por inhalar el humo de otras personas, aunque nunca hayan fumado un cigarrillo ni utilizado un vapeador.","Por eso, fumar o vapear también pone en riesgo la salud de quienes están alrededor.","Juntos podemos crear ambientes más saludables para todos."]}'::jsonb, 6
FROM modules WHERE slug = 'antitabaco';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Fumadores Pasivos', '{"images":[]}'::jsonb, 7
FROM modules WHERE slug = 'antitabaco';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', '¿Cómo dejar el vape?',
  '{"paragraphs":["Salir de la dependencia es posible. Algunas recomendaciones son:","✔ Caminar, correr o practicar algún deporte.","✔ Mantenerse ocupado con actividades saludables.","✔ Respirar profundamente 10 veces cuando aparezcan las ganas de vapear.","✔ Buscar apoyo de familiares, amigos o profesionales de la salud si es necesario.","Recuerda: nunca es tarde para dejar el tabaco y los vapeadores y mejorar tu salud."]}'::jsonb, 8
FROM modules WHERE slug = 'antitabaco';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Cómo Dejar el Vape', '{"images":[]}'::jsonb, 9
FROM modules WHERE slug = 'antitabaco';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Galería de Infografías', '{"images":[]}'::jsonb, 10
FROM modules WHERE slug = 'antitabaco';

-- ================================================
-- MÓDULO 3: PRÓSTATA
-- ================================================

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', 'Factores de Riesgo para Cáncer de Próstata',
  '{"paragraphs":["Existen factores de riesgo que están asociados con el cáncer de próstata, unos son modificables y otros no.","La edad avanzada es el principal factor de riesgo, ya que la posibilidad va aumentando a medida que una persona envejece. Aproximadamente, 6 de cada 10 casos de cáncer de próstata se presentan en hombres mayores de 65 años.","Los antecedentes familiares también juegan un papel importante. Si el padre o el hermano de un hombre padecen cáncer de próstata, se duplica el riesgo de que este hombre padezca la enfermedad. El riesgo es mucho mayor en el caso de los hombres que tienen varios familiares afectados, particularmente si tales familiares eran jóvenes cuando se les encontró el cáncer."]}'::jsonb, 0
FROM modules WHERE slug = 'prostata';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Factores de Riesgo Próstata', '{"images":[]}'::jsonb, 1
FROM modules WHERE slug = 'prostata';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', 'Otros Factores de Riesgo',
  '{"paragraphs":["La raza o grupo étnico también influye: ocurre con más frecuencia en los hombres afroamericanos y en los hombres del Caribe con ascendencia africana que en los hombres de otras razas. Cuando aparece en estos hombres, tiende a ser en hombres más jóvenes.","La alimentación es un factor modificable: los hombres que consumen muchas carnes rojas y productos lácteos con alto contenido de grasa tienen mayor riesgo, así como el bajo consumo de frutas y verduras. Se recomienda una dieta alta en tomates, cítricos, soya y cereales.","La obesidad y la exposición a sustancias químicas como el arsénico y pesticidas también pueden aumentar el riesgo de cáncer de próstata invasivo."]}'::jsonb, 2
FROM modules WHERE slug = 'prostata';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Alimentación y Riesgo', '{"images":[]}'::jsonb, 3
FROM modules WHERE slug = 'prostata';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', 'Exámenes de Detección Temprana',
  '{"paragraphs":["Las pruebas de detección tienen el objetivo de descubrir anormalidades de la glándula prostática antes de que se presente algún síntoma.","En Colombia se realiza la prueba de Antígeno Prostático Específico (PSA) y el tacto rectal en una frecuencia no inferior a 5 años.","El antígeno prostático específico (PSA) es una proteína producida por las células presentes en la glándula prostática. El PSA se encuentra principalmente en el semen, aunque también se encuentra en pequeñas cantidades en la sangre. Los valores de PSA pueden variar con la edad."]}'::jsonb, 4
FROM modules WHERE slug = 'prostata';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Exámenes de Detección', '{"images":[]}'::jsonb, 5
FROM modules WHERE slug = 'prostata';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', 'Examen Digital y Diagnóstico',
  '{"paragraphs":["El examen digital del recto permite al médico palpar cualquier bulto o zona firme en la próstata que pudiera ser cáncer. Este examen puede ser incómodo, pero generalmente no es doloroso y sólo dura poco tiempo.","Si los resultados del PSA y del examen rectal sugieren que podría tener cáncer de próstata, lo más probable es que necesite una biopsia de la próstata.","Una biopsia es un procedimiento donde se emplea una aguja gruesa para extraer pequeñas muestras de la próstata y examinarlas al microscopio. Esta prueba la realiza un urólogo."]}'::jsonb, 6
FROM modules WHERE slug = 'prostata';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Diagnóstico Próstata', '{"images":[]}'::jsonb, 7
FROM modules WHERE slug = 'prostata';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Galería de Infografías', '{"images":[]}'::jsonb, 8
FROM modules WHERE slug = 'prostata';

-- ================================================
-- MÓDULO 4: PIEL
-- ================================================

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', '¿Qué es el Cáncer de Piel?',
  '{"paragraphs":["El cáncer de piel se define como una enfermedad en la que se da una multiplicación rápida y desordenada de células anormales, inicialmente de la epidermis (capa más superficial de la piel). Con el tiempo, estas células malignas continúan creciendo hacia tejidos más profundos pudiendo llegar a músculos y huesos, o desprenderse del tumor inicial y viajar a otro tejido.","La mayoría de los cánceres de la piel se forman en las partes del cuerpo expuestas al sol, en las personas de edad avanzada o en personas con un sistema inmunitario debilitado.","Hay varios tipos de cáncer de piel, siendo los más comunes el carcinoma de células basales, carcinoma de células escamosas y melanoma. El melanoma es el más peligroso aunque menos común."]}'::jsonb, 0
FROM modules WHERE slug = 'piel';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Tipos de Cáncer de Piel', '{"images":[]}'::jsonb, 1
FROM modules WHERE slug = 'piel';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', 'Factores de Riesgo',
  '{"paragraphs":["El tipo de piel es un factor importante: los individuos de piel clara (fototipo I y II) que se queman con mayor facilidad tienen un riesgo diez veces mayor de desarrollar cáncer de piel comparado con las personas de raza negra (fototipo IV), quienes tienen una mayor cantidad de melanina.","La altura sobre el nivel del mar también influye: por cada 1000 metros hay un incremento de entre 5% y 7% de radiación UV. En países sobre el trópico, los rayos solares llegan de forma perpendicular a la tierra.","La exposición frecuente e intensa a la radiación UV del sol es el principal factor de riesgo ambiental. Las quemaduras solares repetidas y graves, especialmente en la infancia, aumentan significativamente el riesgo."]}'::jsonb, 2
FROM modules WHERE slug = 'piel';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Factores de Riesgo Piel', '{"images":[]}'::jsonb, 3
FROM modules WHERE slug = 'piel';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', 'Historial Personal y Familiar',
  '{"paragraphs":["El riesgo de desarrollar melanoma se incrementa de manera significativa si hay antecedentes en uno o más familiares de primer grado. Aproximadamente el 10% de todas las personas con melanoma tienen un historial familiar.","Las mutaciones genéticas en las células de la piel pueden inducir un descontrol de las funciones de crecimiento. Algunas de estas células alteradas pueden permanecer silentes sin crecer durante años, por eso se dice que la piel tiene memoria.","El sistema inmunitario también juega un papel muy importante en el control y eliminación de las células alteradas. Cuando la función inmunitaria disminuye, hay mayor riesgo de desarrollar un cáncer cutáneo."]}'::jsonb, 4
FROM modules WHERE slug = 'piel';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Historial Familiar Piel', '{"images":[]}'::jsonb, 5
FROM modules WHERE slug = 'piel';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', 'Autoexamen de la Piel',
  '{"paragraphs":["El mejor momento para revisarse la piel es después de bañarse o ducharse. Se requiere una habitación bien iluminada, un espejo de cuerpo entero y un espejo de mano. Si es posible, pida ayuda de su pareja o un familiar de confianza.","Examine su cara, orejas, cuello, pecho y abdomen frente al espejo. Revise sus axilas, ambos lados de los brazos, las palmas y el dorso de las manos. Sentado, revise la parte delantera de sus muslos, espinillas y pies.","Use la regla ABCDE para identificar cambios sospechosos: Asimetría, Bordes irregulares, Color variable, Diámetro mayor a 6mm, y Evolución o cambio en el tiempo."]}'::jsonb, 6
FROM modules WHERE slug = 'piel';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Autoexamen de Piel', '{"images":[]}'::jsonb, 7
FROM modules WHERE slug = 'piel';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', 'Protección Solar',
  '{"paragraphs":["La protección solar es fundamental para prevenir el cáncer de piel. Usa bloqueador solar SPF 30 o mayor todos los días, incluso en días nublados. Reaplica el bloqueador cada 2 horas si estás al aire libre.","Usa ropa de manga larga, sombrero de ala ancha, sombrilla y gafas con filtro UV. Evita el sol entre las 10am y las 4pm (radiación más intensa).","No se recomienda el uso de camas solares o bronceadores artificiales, ya que exponen a radiación UV concentrada. Examina tu piel completa una vez al mes para identificar cambios."]}'::jsonb, 8
FROM modules WHERE slug = 'piel';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Protección Solar', '{"images":[]}'::jsonb, 9
FROM modules WHERE slug = 'piel';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Galería de Infografías', '{"images":[]}'::jsonb, 10
FROM modules WHERE slug = 'piel';

-- ================================================
-- MÓDULO 5: MAMA
-- ================================================

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', 'Conoce tu Cuerpo',
  '{"paragraphs":["La campaña de la Liga contra el Cáncer busca que todas las personas aprendan a reconocer sus cuerpos e identifiquen cualquier cambio extraño lo antes posible. El autocuidado es el primer paso para un futuro saludable.","En Colombia, el cáncer de mama es la enfermedad más frecuente entre las mujeres. Cada año se presentan miles de nuevos casos, muchos de los cuales podrían detectarse más temprano con el conocimiento adecuado.","Realizar autoexámenes regularmente y estar atenta a cualquier cambio en tus mamas es fundamental para tu salud y bienestar."]}'::jsonb, 0
FROM modules WHERE slug = 'mama';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Conoce tu Cuerpo', '{"images":[]}'::jsonb, 1
FROM modules WHERE slug = 'mama';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', '5 Señales de Alerta',
  '{"paragraphs":["Si notas alguno de estos cambios y persiste por más de tres semanas, acude a tu médico de inmediato:","✔ Bultos o masas en el pecho o la axila.","✔ Cambios en la forma o el tamaño de la mama.","✔ Hundimiento del pezón o secreción de líquidos extraños.","✔ Piel con aspecto de cáscara de naranja, roja o irritada.","✔ Venas que crecen o se hacen muy visibles.","Muchas de estas señales pueden tener otras causas, pero es importante que un médico las evalúe para estar segura."]}'::jsonb, 2
FROM modules WHERE slug = 'mama';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Señales de Alerta Mama', '{"images":[]}'::jsonb, 3
FROM modules WHERE slug = 'mama';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', 'Tu Ruta de Detección',
  '{"paragraphs":["Para detectar el cáncer antes de que aparezcan los síntomas, sigue estas recomendaciones:","1. Examen Clínico: Todas las mujeres a partir de los 40 años deben realizarse un examen físico con un profesional una vez al año.","2. Mamografía: Si tienes entre 50 y 69 años, este examen es clave y debe hacerse cada 2 años. Es una radiografía segura que busca problemas que no se sienten a simple vista.","3. Autoexamen: Realízalo 8 días después de tu período. Mírate al espejo, palpa desde la axila hasta el pezón y observa cualquier cambio.","No estás sola en este camino. En la Liga contra el Cáncer Zonal Tolima estamos para acompañarte y guiarte en tu prevención."]}'::jsonb, 4
FROM modules WHERE slug = 'mama';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Ruta de Detección Mama', '{"images":[]}'::jsonb, 5
FROM modules WHERE slug = 'mama';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', 'Factores que Puedes Controlar',
  '{"paragraphs":["Aunque algunos factores no se pueden cambiar (como la genética o la edad), puedes reducir el riesgo con hábitos saludables.","Reducir o eliminar el consumo de alcohol podría evitar hasta el 14% de los casos de cáncer de mama. También ayuda hacer ejercicio regularmente (mínimo 150 minutos a la semana), mantener un peso saludable, consumir frutas y verduras abundantes, y limitar la ingesta de grasas saturadas.","Estos cambios no solo reducen el riesgo de cáncer de mama, sino que mejoran tu salud general y tu calidad de vida."]}'::jsonb, 6
FROM modules WHERE slug = 'mama';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Factores Controlables Mama', '{"images":[]}'::jsonb, 7
FROM modules WHERE slug = 'mama';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Galería de Infografías', '{"images":[]}'::jsonb, 8
FROM modules WHERE slug = 'mama';

-- ================================================
-- MÓDULO 6: DIGESTIVAS
-- ================================================

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', '¿Qué es el Cáncer Gástrico?',
  '{"paragraphs":["El cáncer gástrico o de estómago es un término general con el que se denomina a cualquier tumor maligno que surge de las células de alguna de las capas del estómago. En el 90% de los casos el cáncer gástrico se origina en las mucosas y presenta diferentes factores de riesgo.","Es dos veces más frecuente en varones que en mujeres y tiene cierto componente hereditario (1% al 3%) que permite adoptar medidas preventivas.","Es un tumor de alta mortalidad, por eso cuando se detecta alguna úlcera gástrica se debe realizar una biopsia para conocer si tiene transformación maligna o no."]}'::jsonb, 0
FROM modules WHERE slug = 'digestivas';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Cáncer Gástrico', '{"images":[]}'::jsonb, 1
FROM modules WHERE slug = 'digestivas';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', 'Factores de Riesgo',
  '{"paragraphs":["Las causas exactas del cáncer gástrico no se conocen completamente, aunque se sabe que existen factores de riesgo que favorecen su aparición.","La infección por Helicobacter pylori (H pylori) parece ser la causa principal, ya que puede ocasionar una gastritis atrófica y otros cambios precancerosos en el revestimiento interno del estómago.","Otros factores de riesgo incluyen: la edad (mayoría entre 60-80 años), ubicación geográfica (más común en Asia Oriental y Europa Oriental), sobrepeso u obesidad, y antecedentes familiares."]}'::jsonb, 2
FROM modules WHERE slug = 'digestivas';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Factores de Riesgo Digestivas', '{"images":[]}'::jsonb, 3
FROM modules WHERE slug = 'digestivas';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', 'Alimentación y Estilo de Vida',
  '{"paragraphs":["La alimentación juega un papel importante en el riesgo de cáncer gástrico. El riesgo es mayor en personas cuyas dietas incluyen grandes cantidades de alimentos preservados con sal, como carnes y pescados salados, y verduras encurtidas.","Consumir carnes procesadas, asadas a la parrilla o al carbón con frecuencia parece aumentar el riesgo. Por el contrario, consumir muchas frutas frescas (especialmente cítricos) y verduras crudas parece reducir el riesgo.","El consumo de alcohol (3 o más bebidas por día) y el tabaquismo también aumentan significativamente el riesgo de cáncer gástrico."]}'::jsonb, 4
FROM modules WHERE slug = 'digestivas';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Alimentación y Digestivas', '{"images":[]}'::jsonb, 5
FROM modules WHERE slug = 'digestivas';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', 'Señales de Alarma',
  '{"paragraphs":["El cáncer de estómago en etapa inicial pocas veces causa síntomas. Por esta razón, la mayoría de los cánceres de estómago no se detectan hasta que son bastante grandes o se han propagado.","Cuando el cáncer de estómago sí causa síntomas, estos pueden incluir: poco apetito, pérdida de peso sin causa aparente, dolor abdominal, sensación de llenura después de comer solo una pequeña comida, acidez o indigestión, y náuseas y vómito.","Estos síntomas no son exclusivos del cáncer gástrico, ya que pueden aparecer en la úlcera gástrica, gastritis u otras enfermedades. Por esta razón, si estos síntomas no desaparecen o empeoran, debes consultar con un médico."]}'::jsonb, 6
FROM modules WHERE slug = 'digestivas';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Señales de Alarma Digestivas', '{"images":[]}'::jsonb, 7
FROM modules WHERE slug = 'digestivas';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'text', 'Detección Temprana y Diagnóstico',
  '{"paragraphs":["Solo países como Japón y Corea, donde la prevalencia de cáncer gástrico es elevada, realizan exámenes de diagnóstico oportuno en población aparentemente sana a partir de los 40 años.","El primer paso es la valoración médica, donde se indaga sobre antecedentes personales y familiares, y se realiza el examen físico. El médico podría solicitar un análisis de sangre para ver si tiene anemia.","Si se sospecha cáncer gástrico, el médico podría referirte a un gastroenterólogo que realizará una endoscopia superior (EGD). Durante este examen se pueden tomar muestras de biopsia. La biopsia es la única manera de confirmar si se trata de cáncer."]}'::jsonb, 8
FROM modules WHERE slug = 'digestivas';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Imagen - Diagnóstico Digestivas', '{"images":[]}'::jsonb, 9
FROM modules WHERE slug = 'digestivas';

INSERT INTO content_blocks (module_id, block_type, title, content, order_index)
SELECT id, 'images', 'Galería de Infografías', '{"images":[]}'::jsonb, 10
FROM modules WHERE slug = 'digestivas';

-- ================================================
-- PREGUNTAS DE QUIZ (3 por módulo)
-- ================================================

-- VPH
INSERT INTO quiz_questions (module_id, question, options, correct_index, explanation, order_index)
SELECT id,
  '¿Qué porcentaje de los casos de cáncer de cuello uterino se deben al VPH?',
  '["50%","70%","Entre el 90% y el 99%","30%"]'::jsonb,
  2,
  'Entre el 90% y el 99% de los casos de cáncer de cuello uterino se deben a una infección persistente por VPH, especialmente los tipos 16 y 18 de alto riesgo.',
  0
FROM modules WHERE slug = 'vph';

INSERT INTO quiz_questions (module_id, question, options, correct_index, explanation, order_index)
SELECT id,
  '¿A quiénes va dirigida la vacuna contra el VPH?',
  '["Solo mujeres mayores de 18 años","Niños, niñas y adolescentes de 9 a 17 años","Solo personas de 30 a 50 años","Solo hombres"]'::jsonb,
  1,
  'La vacuna contra el VPH está dirigida a niños, niñas y adolescentes de 9 a 17 años, y es gratuita y eficaz.',
  1
FROM modules WHERE slug = 'vph';

INSERT INTO quiz_questions (module_id, question, options, correct_index, explanation, order_index)
SELECT id,
  '¿Qué prueba de detección está disponible gratuitamente en Colombia para mujeres mayores de 30 años?',
  '["Biopsia de tejido","Resonancia magnética","Prueba ADN-VPH","Tomografía computada"]'::jsonb,
  2,
  'La prueba ADN-VPH es gratuita en Colombia y ayuda a detectar a tiempo el riesgo de cáncer de cuello uterino en mujeres mayores de 30 años.',
  2
FROM modules WHERE slug = 'vph';

-- Tabaco
INSERT INTO quiz_questions (module_id, question, options, correct_index, explanation, order_index)
SELECT id,
  '¿Cuántas personas mueren cada año en el mundo por causas relacionadas al tabaco?',
  '["Más de 1 millón","Más de 8 millones","500 mil","3 millones"]'::jsonb,
  1,
  'El tabaquismo mata a más de 8 millones de personas al año a nivel global, siendo el principal factor de riesgo del cáncer de pulmón.',
  0
FROM modules WHERE slug = 'antitabaco';

INSERT INTO quiz_questions (module_id, question, options, correct_index, explanation, order_index)
SELECT id,
  '¿Qué porcentaje de los casos de cáncer de pulmón está directamente asociado al tabaco?',
  '["50%","65%","Aproximadamente el 85%","30%"]'::jsonb,
  2,
  'Aproximadamente el 85% de los casos de cáncer de pulmón están directamente asociados al consumo de tabaco.',
  1
FROM modules WHERE slug = 'antitabaco';

INSERT INTO quiz_questions (module_id, question, options, correct_index, explanation, order_index)
SELECT id,
  '¿En qué rango de edad se encuentran la mayoría de usuarios de vapeadores en Colombia?',
  '["25-35 años","Mayores de 40 años","Entre 12 y 24 años","Entre 35 y 50 años"]'::jsonb,
  2,
  'En Colombia, aproximadamente 1,1 millones de personas han usado vapeadores y la mayoría tiene entre 12 y 24 años.',
  2
FROM modules WHERE slug = 'antitabaco';

-- Próstata
INSERT INTO quiz_questions (module_id, question, options, correct_index, explanation, order_index)
SELECT id,
  '¿En qué grupo de edad se presenta aproximadamente el 60% de los casos de cáncer de próstata?',
  '["Mayores de 40 años","Entre 50 y 60 años","Mayores de 65 años","Menores de 50 años"]'::jsonb,
  2,
  'Aproximadamente 6 de cada 10 casos de cáncer de próstata se presentan en hombres mayores de 65 años.',
  0
FROM modules WHERE slug = 'prostata';

INSERT INTO quiz_questions (module_id, question, options, correct_index, explanation, order_index)
SELECT id,
  '¿Cuánto aumenta el riesgo de cáncer de próstata si el padre o hermano lo padecen?',
  '["No cambia significativamente","Se triplica","Se duplica","Aumenta un 10%"]'::jsonb,
  2,
  'Si el padre o el hermano padecen cáncer de próstata, el riesgo se duplica. Es mucho mayor si varios familiares están afectados.',
  1
FROM modules WHERE slug = 'prostata';

INSERT INTO quiz_questions (module_id, question, options, correct_index, explanation, order_index)
SELECT id,
  '¿Qué es el PSA?',
  '["Un tipo de cáncer de próstata","Antígeno Prostático Específico producido por la glándula prostática","Un medicamento para el tratamiento","Una prueba de imagen"]'::jsonb,
  1,
  'El PSA (Antígeno Prostático Específico) es una proteína producida por las células de la glándula prostática. Se usa como marcador en la detección temprana.',
  2
FROM modules WHERE slug = 'prostata';

-- Piel
INSERT INTO quiz_questions (module_id, question, options, correct_index, explanation, order_index)
SELECT id,
  '¿Cuántas veces mayor es el riesgo de cáncer de piel en personas de piel clara frente a personas de piel oscura?',
  '["2 veces mayor","5 veces mayor","10 veces mayor","20 veces mayor"]'::jsonb,
  2,
  'Los individuos de piel clara (fototipo I y II) tienen un riesgo diez veces mayor de desarrollar cáncer de piel comparado con personas de piel oscura.',
  0
FROM modules WHERE slug = 'piel';

INSERT INTO quiz_questions (module_id, question, options, correct_index, explanation, order_index)
SELECT id,
  '¿Qué representa la letra E en la regla ABCDE del autoexamen de piel?',
  '["Extensión de la lesión","Eritema o enrojecimiento","Evolución o cambio en el tiempo","Espesor de la lesión"]'::jsonb,
  2,
  'La E en la regla ABCDE significa Evolución: cualquier cambio de tamaño, forma, color o síntoma en un lunar debe ser evaluado por un médico.',
  1
FROM modules WHERE slug = 'piel';

INSERT INTO quiz_questions (module_id, question, options, correct_index, explanation, order_index)
SELECT id,
  '¿Con qué frecuencia se recomienda el autoexamen completo de piel?',
  '["Una vez al año","Una vez por semana","Una vez al mes","Cada 6 meses"]'::jsonb,
  2,
  'Se recomienda examinar la piel completa una vez al mes para identificar cambios a tiempo. El mejor momento es después de bañarse o ducharse.',
  2
FROM modules WHERE slug = 'piel';

-- Mama
INSERT INTO quiz_questions (module_id, question, options, correct_index, explanation, order_index)
SELECT id,
  '¿Hasta qué porcentaje pueden aumentar las posibilidades de recuperación del cáncer de mama con un diagnóstico a tiempo?',
  '["Hasta el 50%","Hasta el 70%","Hasta el 90%","Hasta el 60%"]'::jsonb,
  2,
  'Un diagnóstico temprano de cáncer de mama puede aumentar las posibilidades de recuperación hasta en un 90%.',
  0
FROM modules WHERE slug = 'mama';

INSERT INTO quiz_questions (module_id, question, options, correct_index, explanation, order_index)
SELECT id,
  '¿Cuándo se recomienda realizar el autoexamen de mama?',
  '["El primer día del mes","8 días después del período","Cada 6 meses en consulta médica","Solo cuando se detecta un síntoma"]'::jsonb,
  1,
  'Se recomienda realizar el autoexamen 8 días después del período, cuando las mamas están menos tensas y es más fácil detectar cambios.',
  1
FROM modules WHERE slug = 'mama';

INSERT INTO quiz_questions (module_id, question, options, correct_index, explanation, order_index)
SELECT id,
  '¿Con qué frecuencia deben hacerse la mamografía las mujeres entre 50 y 69 años?',
  '["Cada año","Cada 2 años","Cada 3 años","Solo cuando hay síntomas"]'::jsonb,
  1,
  'Las mujeres entre 50 y 69 años deben realizarse una mamografía cada 2 años. Este examen busca problemas que no se sienten a simple vista.',
  2
FROM modules WHERE slug = 'mama';

-- Digestivas
INSERT INTO quiz_questions (module_id, question, options, correct_index, explanation, order_index)
SELECT id,
  '¿Cuál es la principal bacteria asociada al desarrollo del cáncer gástrico?',
  '["Salmonella typhi","Escherichia coli","Helicobacter pylori","Streptococcus pneumoniae"]'::jsonb,
  2,
  'La infección por Helicobacter pylori (H. pylori) es considerada la causa principal del cáncer gástrico, ya que puede ocasionar gastritis atrófica y cambios precancerosos.',
  0
FROM modules WHERE slug = 'digestivas';

INSERT INTO quiz_questions (module_id, question, options, correct_index, explanation, order_index)
SELECT id,
  '¿En qué rango de edad se presenta la mayoría de los casos de cáncer gástrico?',
  '["20-40 años","40-60 años","Entre 60 y 80 años","Mayores de 85 años"]'::jsonb,
  2,
  'La mayoría de los casos de cáncer gástrico se presentan en personas entre los 60 y 80 años de edad.',
  1
FROM modules WHERE slug = 'digestivas';

INSERT INTO quiz_questions (module_id, question, options, correct_index, explanation, order_index)
SELECT id,
  '¿Cuál es la única manera de confirmar si una lesión es cáncer gástrico?',
  '["Análisis de sangre completo","Tomografía computada","Biopsia de tejido","Ultrasonido abdominal"]'::jsonb,
  2,
  'La biopsia es la única manera de confirmar si se trata de cáncer. Durante una endoscopia, el gastroenterólogo toma muestras que se examinan al microscopio.',
  2
FROM modules WHERE slug = 'digestivas';

-- ================================================
-- ACTUALIZAR SLIDER PRINCIPAL
-- ================================================

DELETE FROM slider_images;

INSERT INTO slider_images (image_url, title, subtitle, link_type, link_value, is_active, order_index) VALUES
(
  'https://images.pexels.com/photos/4225880/pexels-photo-4225880.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Detección Temprana Salva Vidas',
  'Conoce los módulos educativos sobre prevención del cáncer',
  'section', 'modulos', true, 0
),
(
  'https://images.pexels.com/photos/7313814/pexels-photo-7313814.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Vacunación contra el VPH',
  'Protege a tus hijos desde los 9 años con la vacuna gratuita',
  'module', 'vph', true, 1
),
(
  'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Prevención y Cuidado',
  'Infórmate sobre los factores de riesgo y cómo prevenirlos',
  'section', 'modulos', true, 2
),
(
  'https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Juntos Contra el Cáncer',
  'Liga Contra el Cáncer Zonal Tolima te acompaña',
  'section', 'modulos', true, 3
);
