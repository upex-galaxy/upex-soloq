import type { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal/legal-page-layout';

export const metadata: Metadata = {
  title: 'Politica de Privacidad | SoloQ',
  description: 'Politica de privacidad de SoloQ - plataforma de facturacion para freelancers.',
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Politica de Privacidad" lastUpdated="7 de abril de 2026">
      <section>
        <h2>1. Introduccion</h2>
        <p>
          En SoloQ (&quot;nosotros&quot;, &quot;nuestro&quot; o &quot;la plataforma&quot;), nos
          comprometemos a proteger la privacidad de nuestros usuarios. Esta politica describe como
          recopilamos, usamos, almacenamos y protegemos tu informacion personal cuando utilizas
          nuestra plataforma de facturacion para freelancers.
        </p>
        <p>
          Al registrarte y usar SoloQ, aceptas las practicas descritas en esta politica. Si no estas
          de acuerdo con alguna parte, te recomendamos no utilizar el servicio.
        </p>
      </section>

      <section>
        <h2>2. Datos que Recopilamos</h2>
        <h3>Datos de cuenta</h3>
        <ul>
          <li>Direccion de correo electronico</li>
          <li>Contrasena (almacenada de forma encriptada)</li>
          <li>Fecha de registro y ultimo acceso</li>
        </ul>

        <h3>Datos de perfil de negocio</h3>
        <ul>
          <li>Nombre del negocio o nombre profesional</li>
          <li>Logo del negocio</li>
          <li>Informacion de contacto (email, telefono, direccion)</li>
          <li>Datos fiscales (RFC, CUIT, RUT u otro identificador tributario)</li>
          <li>Metodos de pago configurados</li>
        </ul>

        <h3>Datos de facturacion</h3>
        <ul>
          <li>Informacion de clientes (nombre, email, empresa, direccion)</li>
          <li>Facturas creadas (montos, items, fechas, estado)</li>
          <li>Historial de pagos recibidos</li>
          <li>Notas y terminos incluidos en facturas</li>
        </ul>

        <h3>Datos de uso</h3>
        <ul>
          <li>Registro de actividad dentro de la plataforma</li>
          <li>Tipo de navegador y dispositivo</li>
          <li>Direccion IP y ubicacion aproximada</li>
        </ul>
      </section>

      <section>
        <h2>3. Como Usamos tus Datos</h2>
        <p>Utilizamos tu informacion para:</p>
        <ul>
          <li>Proveer y mantener el servicio de facturacion</li>
          <li>Generar facturas en PDF con tus datos de negocio</li>
          <li>Enviar facturas por email a tus clientes</li>
          <li>Enviar recordatorios de pago (usuarios Pro)</li>
          <li>Calcular estadisticas y reportes en tu dashboard</li>
          <li>Comunicar actualizaciones importantes del servicio</li>
          <li>Mejorar la plataforma y la experiencia de usuario</li>
        </ul>
      </section>

      <section>
        <h2>4. Almacenamiento y Seguridad</h2>
        <p>
          Tus datos se almacenan en infraestructura segura proporcionada por Supabase, con
          encriptacion en transito (TLS/SSL) y en reposo. Implementamos las siguientes medidas de
          seguridad:
        </p>
        <ul>
          <li>Encriptacion de contrasenas mediante algoritmos seguros de hashing</li>
          <li>Politicas de acceso a nivel de fila (Row Level Security) en la base de datos</li>
          <li>Backups automaticos periodicos</li>
          <li>Autenticacion segura con tokens JWT</li>
          <li>Proteccion contra ataques comunes (XSS, CSRF, inyeccion SQL)</li>
        </ul>
      </section>

      <section>
        <h2>5. Compartir con Terceros</h2>
        <p>
          No vendemos, alquilamos ni compartimos tu informacion personal con terceros para fines de
          marketing. Solo compartimos datos en los siguientes casos:
        </p>
        <ul>
          <li>
            <strong>Proveedores de infraestructura:</strong> Supabase (base de datos y
            autenticacion), Vercel (hosting), Resend (envio de emails).
          </li>
          <li>
            <strong>Procesadores de pago:</strong> Cuando suscribes al plan Pro, tu pago es
            procesado por proveedores de pago externos que tienen sus propias politicas de
            privacidad.
          </li>
          <li>
            <strong>Obligaciones legales:</strong> Si la ley lo requiere o para proteger nuestros
            derechos legales.
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Tus Derechos</h2>
        <p>Como usuario de SoloQ, tienes derecho a:</p>
        <ul>
          <li>
            <strong>Acceder</strong> a toda tu informacion personal almacenada en la plataforma
          </li>
          <li>
            <strong>Rectificar</strong> datos incorrectos o desactualizados desde tu configuracion
          </li>
          <li>
            <strong>Eliminar</strong> tu cuenta y todos los datos asociados
          </li>
          <li>
            <strong>Exportar</strong> tus datos en formatos estandar
          </li>
          <li>
            <strong>Revocar</strong> tu consentimiento en cualquier momento
          </li>
        </ul>
        <p>
          Para ejercer cualquiera de estos derechos, contactanos a{' '}
          <a href="mailto:hola@soloq.app" className="text-primary hover:underline">
            hola@soloq.app
          </a>
          .
        </p>
      </section>

      <section>
        <h2>7. Cookies</h2>
        <p>
          SoloQ utiliza cookies esenciales para el funcionamiento del servicio, incluyendo cookies de
          sesion para mantener tu autenticacion. No utilizamos cookies de seguimiento publicitario ni
          de terceros para fines de marketing.
        </p>
      </section>

      <section>
        <h2>8. Retencion de Datos</h2>
        <p>
          Conservamos tus datos mientras tu cuenta este activa. Si decides eliminar tu cuenta,
          eliminaremos tu informacion personal dentro de los 30 dias siguientes. Sin embargo, podemos
          retener ciertos datos financieros durante el periodo requerido por las leyes fiscales
          aplicables en tu jurisdiccion.
        </p>
      </section>

      <section>
        <h2>9. Cambios a esta Politica</h2>
        <p>
          Podemos actualizar esta politica periodicamente. Te notificaremos sobre cambios
          significativos a traves del email registrado en tu cuenta. El uso continuado del servicio
          despues de los cambios constituye tu aceptacion de la politica actualizada.
        </p>
      </section>

      <section>
        <h2>10. Contacto</h2>
        <p>
          Si tienes preguntas sobre esta politica de privacidad o sobre como manejamos tus datos,
          contactanos en{' '}
          <a href="mailto:hola@soloq.app" className="text-primary hover:underline">
            hola@soloq.app
          </a>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}
