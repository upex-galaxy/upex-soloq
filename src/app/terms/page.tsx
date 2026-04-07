import type { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal/legal-page-layout';

export const metadata: Metadata = {
  title: 'Terminos de Servicio | SoloQ',
  description: 'Terminos y condiciones de uso de SoloQ - plataforma de facturacion para freelancers.',
};

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terminos de Servicio" lastUpdated="7 de abril de 2026">
      <section>
        <h2>1. Aceptacion de los Terminos</h2>
        <p>
          Al registrarte y utilizar SoloQ (&quot;el servicio&quot;, &quot;la plataforma&quot;),
          aceptas estos terminos de servicio en su totalidad. Si no estas de acuerdo con alguna
          parte de estos terminos, no debes utilizar el servicio.
        </p>
        <p>
          Estos terminos aplican a todos los usuarios de SoloQ, incluyendo usuarios del plan
          gratuito y del plan Pro.
        </p>
      </section>

      <section>
        <h2>2. Descripcion del Servicio</h2>
        <p>
          SoloQ es una plataforma de facturacion disenada para freelancers latinoamericanos. El
          servicio permite:
        </p>
        <ul>
          <li>Crear y gestionar facturas profesionales en formato PDF</li>
          <li>Administrar una base de datos de clientes</li>
          <li>Enviar facturas por correo electronico</li>
          <li>Hacer seguimiento del estado de pagos</li>
          <li>Configurar recordatorios automaticos de cobro (plan Pro)</li>
          <li>Visualizar estadisticas de facturacion en un dashboard</li>
        </ul>
        <p>
          SoloQ es una herramienta de gestion. No somos una entidad financiera, no procesamos pagos
          entre tu y tus clientes, y no somos responsables del cobro de tus facturas.
        </p>
      </section>

      <section>
        <h2>3. Registro y Cuenta</h2>
        <p>
          Para usar SoloQ necesitas crear una cuenta con un correo electronico valido. Eres
          responsable de:
        </p>
        <ul>
          <li>Mantener la confidencialidad de tus credenciales de acceso</li>
          <li>Toda la actividad que ocurra bajo tu cuenta</li>
          <li>Notificarnos inmediatamente si sospechas un acceso no autorizado</li>
          <li>Proporcionar informacion veraz y mantenerla actualizada</li>
        </ul>
        <p>
          Nos reservamos el derecho de suspender o eliminar cuentas que violen estos terminos o que
          muestren actividad sospechosa.
        </p>
      </section>

      <section>
        <h2>4. Planes y Pagos</h2>
        <h3>Plan Gratuito</h3>
        <p>
          El plan gratuito incluye acceso a las funcionalidades esenciales de facturacion sin limite
          de tiempo ni de facturas. No requiere tarjeta de credito.
        </p>

        <h3>Plan Pro</h3>
        <p>
          El plan Pro es una suscripcion mensual que agrega funcionalidades avanzadas como
          recordatorios automaticos, templates premium y analytics. El cobro se realiza de forma
          recurrente al inicio de cada periodo de facturacion.
        </p>
        <ul>
          <li>Los precios se muestran en dolares estadounidenses (USD)</li>
          <li>
            Puedes cancelar en cualquier momento y mantendras el acceso hasta el final del periodo
            pagado
          </li>
          <li>
            No ofrecemos reembolsos por periodos parciales, excepto cuando la ley local lo requiera
          </li>
          <li>Nos reservamos el derecho de modificar precios con 30 dias de aviso previo</li>
        </ul>
      </section>

      <section>
        <h2>5. Uso Aceptable</h2>
        <p>Al usar SoloQ, te comprometes a no:</p>
        <ul>
          <li>Usar el servicio para actividades ilegales o fraudulentas</li>
          <li>Crear facturas falsas o con informacion enganosa</li>
          <li>Intentar acceder a cuentas o datos de otros usuarios</li>
          <li>Interferir con el funcionamiento normal de la plataforma</li>
          <li>Usar sistemas automatizados para acceder al servicio sin autorizacion</li>
          <li>Revender o redistribuir el acceso al servicio</li>
        </ul>
      </section>

      <section>
        <h2>6. Propiedad Intelectual</h2>
        <p>
          <strong>Tu contenido:</strong> Las facturas, datos de clientes y toda la informacion que
          ingresas en SoloQ te pertenecen. Nosotros no reclamamos propiedad sobre tu contenido.
        </p>
        <p>
          <strong>Nuestro servicio:</strong> El diseno, codigo, marca, logos y funcionalidades de
          SoloQ son propiedad de SoloQ. No puedes copiar, modificar, distribuir o crear obras
          derivadas de la plataforma sin autorizacion escrita.
        </p>
      </section>

      <section>
        <h2>7. Limitacion de Responsabilidad</h2>
        <p>
          SoloQ se proporciona &quot;tal cual&quot; y &quot;segun disponibilidad&quot;. No
          garantizamos que el servicio sera ininterrumpido, seguro o libre de errores. En la maxima
          medida permitida por la ley aplicable:
        </p>
        <ul>
          <li>
            No somos responsables de perdidas economicas derivadas del uso o la imposibilidad de uso
            del servicio
          </li>
          <li>
            No somos responsables de errores en los calculos de facturas si los datos ingresados son
            incorrectos
          </li>
          <li>
            No somos responsables de la entrega de emails a tus clientes (dependemos de
            infraestructura de terceros)
          </li>
          <li>
            Nuestra responsabilidad total esta limitada al monto pagado por el servicio en los
            ultimos 12 meses
          </li>
        </ul>
      </section>

      <section>
        <h2>8. Cancelacion y Terminacion</h2>
        <p>
          <strong>Por tu parte:</strong> Puedes cancelar tu cuenta en cualquier momento. Al cancelar,
          perderas acceso a la plataforma y tus datos seran eliminados dentro de los 30 dias
          siguientes, salvo datos que debamos retener por obligaciones legales.
        </p>
        <p>
          <strong>Por nuestra parte:</strong> Podemos suspender o terminar tu cuenta si violas estos
          terminos, si tu cuenta muestra actividad fraudulenta, o si es necesario por razones
          legales. Te notificaremos por email con al menos 15 dias de anticipacion, salvo en casos de
          violaciones graves.
        </p>
      </section>

      <section>
        <h2>9. Disponibilidad del Servicio</h2>
        <p>
          Nos esforzamos por mantener SoloQ disponible las 24 horas del dia, los 7 dias de la
          semana. Sin embargo, pueden ocurrir interrupciones por mantenimiento programado, problemas
          tecnicos o circunstancias fuera de nuestro control. Comunicaremos interrupciones
          programadas con anticipacion cuando sea posible.
        </p>
      </section>

      <section>
        <h2>10. Ley Aplicable</h2>
        <p>
          Estos terminos se rigen por las leyes aplicables en la jurisdiccion donde opera SoloQ.
          Cualquier disputa sera resuelta primero a traves de negociacion de buena fe. Si no se llega
          a un acuerdo, las disputas se someteren a la jurisdiccion de los tribunales competentes.
        </p>
      </section>

      <section>
        <h2>11. Cambios a los Terminos</h2>
        <p>
          Podemos modificar estos terminos en cualquier momento. Te notificaremos sobre cambios
          significativos a traves del email registrado en tu cuenta con al menos 30 dias de
          anticipacion. El uso continuado del servicio despues de la fecha efectiva de los cambios
          constituye tu aceptacion de los terminos actualizados.
        </p>
      </section>

      <section>
        <h2>12. Contacto</h2>
        <p>
          Para preguntas sobre estos terminos de servicio, contactanos en{' '}
          <a href="mailto:hola@soloq.app" className="text-primary hover:underline">
            hola@soloq.app
          </a>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}
