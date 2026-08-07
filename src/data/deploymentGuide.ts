import { DeploymentStep } from '../types';

export const DEPLOYMENT_STEPS: DeploymentStep[] = [
  {
    id: 1,
    title: '1. Descargar e Instalar las Herramientas Gratis',
    shortDesc: 'Node.js, Git y Visual Studio Code en 5 minutos.',
    iconName: 'Download',
    detailedContent: {
      whatIsIt: 'Para que tu computadora pueda ejecutar la página web y enviar las postulaciones de empleo, necesita 3 programas gratuitos básicos.',
      whyNeeded: 'Son las herramientas estándar que usan todos los creadores de páginas web en el mundo.',
      steps: [
        '1. Instala Node.js: Ingresa a "nodejs.org" y descarga la versión recomendada (LTS). Es el "motor" que hace andar la página.',
        '2. Instala Git: Entra a "git-scm.com" y dale a Siguiente en todas las opciones por defecto.',
        '3. Instala VS Code (Visual Studio Code): Ve a "code.visualstudio.com" y descárgalo. Es la ventana o editor desde donde verás los archivos de la app.'
      ],
      proTips: [
        '💡 Tip para principiantes: Cuando instales Node.js y Git, no hace falta cambiar ninguna opción avanzada. Solo dale a "Next / Siguiente" a todo.'
      ]
    }
  },
  {
    id: 2,
    title: '2. Abrir la Carpeta del Proyecto en tu Computadora',
    shortDesc: 'Cómo abrir el proyecto en VS Code y abrir la consola.',
    iconName: 'FolderOpen',
    detailedContent: {
      whatIsIt: 'Una vez descargada la carpeta de la app en tu computadora (o clonada desde GitHub), la abriremos en el editor de código.',
      whyNeeded: 'Para poder encender el motor de la web y personalizar tu curriculum.',
      steps: [
        '1. Abre Visual Studio Code.',
        '2. Ve a Archivo > Abrir Carpeta (File > Open Folder) y selecciona la carpeta de esta aplicación.',
        '3. Abre la consola de comandos presionando las teclas Ctrl + Shift + Ñ (o en el menú superior: Terminal > Nueva Terminal).'
      ],
      proTips: [
        '💡 En la parte inferior de VS Code verás una pantalla negra con letras. ¡Esa es la consola donde pondremos solo 2 comandos sencillos!'
      ]
    }
  },
  {
    id: 3,
    title: '3. Encender la Aplicación en tu Computadora (Modo Local)',
    shortDesc: 'Instalar librerías e iniciar el servidor con 2 comandos.',
    iconName: 'Play',
    detailedContent: {
      whatIsIt: 'Instalaremos todos los componentes de la aplicación y la encenderemos para usarla en tu propio navegador web.',
      whyNeeded: 'Para verificar que todo funcione, buscar ofertas reales y personalizar tus cartas de presentación.',
      steps: [
        '1. En la consola de VS Code escribe: npm install y presiona Enter. (Esperar unos segundos a que descargue los componentes).',
        '2. Luego escribe: npm run dev y presiona Enter.',
        '3. Verás un enlace que dice "http://localhost:3000". Hazle Ctrl + Clic y se abrirá la aplicación web en tu navegador Google Chrome o Edge.'
      ],
      codeSnippets: [
        {
          title: 'Paso 1: Descargar librerías',
          code: 'npm install'
        },
        {
          title: 'Paso 2: Encender la web',
          code: 'npm run dev'
        }
      ],
      proTips: [
        '💡 ¡Listo! Ya tienes la web funcionando en tu computadora local.'
      ]
    }
  },
  {
    id: 4,
    title: '4. Conseguir tu Clave Gratuita de Inteligencia Artificial (Gemini API Key)',
    shortDesc: 'Obtén la clave para que la IA redacte las cartas y busque empleos.',
    iconName: 'Key',
    detailedContent: {
      whatIsIt: 'Gemini es la Inteligencia Artificial de Google que analiza las ofertas de trabajo en Argentina y redacta cartas de presentación a tu medida.',
      whyNeeded: 'Para que la búsqueda y las cartas sean 100% reales e inteligentes sin pagar nada.',
      steps: [
        '1. Entra con tu cuenta de Gmail a: aistudio.google.com',
        '2. Haz clic en el botón azul "Get API Key" (Obtener Clave de API) y luego en "Create API Key".',
        '3. Copia el texto largo de letras y números que te generará.',
        '4. En la carpeta de tu proyecto, crea un archivo llamado .env (un punto y la palabra env).',
        '5. Pega dentro la clave así: GEMINI_API_KEY="Tu_Clave_Aqui"'
      ],
      codeSnippets: [
        {
          title: 'Contenido del archivo .env',
          code: 'GEMINI_API_KEY="AIzaSyYourGeneratedGeminiKeyHere"'
        }
      ],
      proTips: [
        '🔒 Mantiene tu clave en secreto. ¡Google te da miles de consultas gratis por mes para buscar empleo!'
      ]
    }
  },
  {
    id: 5,
    title: '5. Subir la Web a Internet GRATIS (Despliegue Final)',
    shortDesc: 'Publica tu web en Vercel o Netlify para usarla desde cualquier celular o PC.',
    iconName: 'Globe',
    detailedContent: {
      whatIsIt: 'Publicar la web en un servidor gratuito para tener tu propio sitio de búsqueda de empleo disponible las 24 horas.',
      whyNeeded: 'Para poder acceder desde tu celular, guardar tus postulaciones y no depender de tener la computadora prendida.',
      steps: [
        '1. Crea una cuenta gratuita en Vercel (vercel.com) ingresando con tu correo o GitHub.',
        '2. Haz clic en "Add New Project" (Agregar nuevo proyecto).',
        '3. Sube la carpeta de tu proyecto o conéctala desde GitHub.',
        '4. En la sección "Environment Variables" (Variables de Entorno), agrega Nombre: GEMINI_API_KEY y Valor: Tu Clave de Gemini.',
        '5. Presiona "Deploy" (Desplegar). En menos de 1 minuto Vercel te dará una dirección URL tipo "mi-buscador-empleos.vercel.app".'
      ],
      proTips: [
        '🎉 ¡Felicitaciones! Ya tienes tu web automatizada de empleo funcionando en vivo en internet sin gastar un solo peso.'
      ]
    }
  }
];
