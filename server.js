const express = require('express');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const { promisify } = require('util');

const execPromise = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Voces disponibles - Todas suenan muy naturales (Microsoft Neural Voices)
const VOCES = {
  // Español Latino
  'maria-cr': { name: 'es-CR-MariaNeural', desc: 'María (Costa Rica) - Femenina, cálida' },
  'juan-cr': { name: 'es-CR-JuanNeural', desc: 'Juan (Costa Rica) - Masculina' },
  'dalia-mx': { name: 'es-MX-DaliaNeural', desc: 'Dalia (México) - Femenina, profesional' },
  'jorge-mx': { name: 'es-MX-JorgeNeural', desc: 'Jorge (México) - Masculina, seria' },
  'beatriz-mx': { name: 'es-MX-BeatrizNeural', desc: 'Beatriz (México) - Femenina, suave' },
  'candela-mx': { name: 'es-MX-CandelaNeural', desc: 'Candela (México) - Femenina, expresiva' },
  'cecilio-mx': { name: 'es-MX-CecilioNeural', desc: 'Cecilio (México) - Masculina, amigable' },
  'gerardo-mx': { name: 'es-MX-GerardoNeural', desc: 'Gerardo (México) - Masculina, formal' },
  'larissa-mx': { name: 'es-MX-LarissaNeural', desc: 'Larissa (México) - Femenina, juvenil' },
  'liberto-mx': { name: 'es-MX-LibertoNeural', desc: 'Liberto (México) - Masculina, casual' },
  'luciano-mx': { name: 'es-MX-LucianoNeural', desc: 'Luciano (México) - Masculina, profunda' },
  'marina-mx': { name: 'es-MX-MarinaNeural', desc: 'Marina (México) - Femenina, clara' },
  'nuria-mx': { name: 'es-MX-NuriaNeural', desc: 'Nuria (México) - Femenina, dulce' },
  'pelayo-mx': { name: 'es-MX-PelayoNeural', desc: 'Pelayo (México) - Masculina, madura' },
  'renata-mx': { name: 'es-MX-RenataNeural', desc: 'Renata (México) - Femenina, elegante' },
  'yago-mx': { name: 'es-MX-YagoNeural', desc: 'Yago (México) - Masculina, joven' },
  
  // Español España
  'elvira-es': { name: 'es-ES-ElviraNeural', desc: 'Elvira (España) - Femenina, clara' },
  'alvaro-es': { name: 'es-ES-AlvaroNeural', desc: 'Álvaro (España) - Masculina, profunda' },
  'abril-es': { name: 'es-ES-AbrilNeural', desc: 'Abril (España) - Femenina, joven' },
  'arnau-es': { name: 'es-ES-ArnauNeural', desc: 'Arnau (España) - Masculina, juvenil' },
  'dario-es': { name: 'es-ES-DarioNeural', desc: 'Darío (España) - Masculina, seria' },
  'elias-es': { name: 'es-ES-EliasNeural', desc: 'Elías (España) - Masculina, cálida' },
  'estrella-es': { name: 'es-ES-EstrellaNeural', desc: 'Estrella (España) - Femenina, expresiva' },
  'irene-es': { name: 'es-ES-IreneNeural', desc: 'Irene (España) - Femenina, suave' },
  'laia-es': { name: 'es-ES-LaiaNeural', desc: 'Laia (España) - Femenina, dulce' },
  'lia-es': { name: 'es-ES-LiaNeural', desc: 'Lía (España) - Femenina, natural' },
  'nil-es': { name: 'es-ES-NilNeural', desc: 'Nil (España) - Masculina, amigable' },
  'saul-es': { name: 'es-ES-SaulNeural', desc: 'Saúl (España) - Masculina, formal' },
  'teo-es': { name: 'es-ES-TeoNeural', desc: 'Teo (España) - Masculina, casual' },
  'triana-es': { name: 'es-ES-TrianaNeural', desc: 'Triana (España) - Femenina, alegre' },
  'vera-es': { name: 'es-ES-VeraNeural', desc: 'Vera (España) - Femenina, profesional' },
  'ximena-es': { name: 'es-ES-XimenaNeural', desc: 'Ximena (España) - Femenina, madura' },
  
  // Español Argentina
  'elena-ar': { name: 'es-AR-ElenaNeural', desc: 'Elena (Argentina) - Femenina, porteña' },
  'tomas-ar': { name: 'es-AR-TomasNeural', desc: 'Tomás (Argentina) - Masculina, rioplatense' },
  
  // Español Colombia
  'salome-co': { name: 'es-CO-SalomeNeural', desc: 'Salomé (Colombia) - Femenina, cálida' },
  'gonzalo-co': { name: 'es-CO-GonzaloNeural', desc: 'Gonzalo (Colombia) - Masculina, amable' },
  
  // Español Chile
  'catalina-cl': { name: 'es-CL-CatalinaNeural', desc: 'Catalina (Chile) - Femenina, clara' },
  'lorenzo-cl': { name: 'es-CL-LorenzoNeural', desc: 'Lorenzo (Chile) - Masculina, seria' },
  
  // Español Perú
  'camila-pe': { name: 'es-PE-CamilaNeural', desc: 'Camila (Perú) - Femenina, suave' },
  'alex-pe': { name: 'es-PE-AlexNeural', desc: 'Alex (Perú) - Masculina, neutral' },
  
  // Inglés USA
  'jenny-us': { name: 'en-US-JennyNeural', desc: 'Jenny (USA) - Female, professional' },
  'guy-us': { name: 'en-US-GuyNeural', desc: 'Guy (USA) - Male, casual' },
  'aria-us': { name: 'en-US-AriaNeural', desc: 'Aria (USA) - Female, expressive' },
  'davis-us': { name: 'en-US-DavisNeural', desc: 'Davis (USA) - Male, friendly' },
  'tony-us': { name: 'en-US-TonyNeural', desc: 'Tony (USA) - Male, deep' },
  'sara-us': { name: 'en-US-SaraNeural', desc: 'Sara (USA) - Female, warm' },
};

// Crear directorio temporal
const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const EDGE_BIN = path.join(__dirname, 'node_modules', '.bin', process.platform === 'win32' ? 'edge-tts.cmd' : 'edge-tts');

// Endpoint: Obtener lista de voces
app.get('/api/voces', (req, res) => {
  const lista = Object.entries(VOCES).map(([id, info]) => ({
    id,
    nombre: info.name,
    descripcion: info.desc
  }));
  res.json(lista);
});

// Endpoint: Generar audio TTS
app.post('/api/tts', async (req, res) => {
  const { texto, voz = 'dalia-mx', velocidad = '+0%', tono = '+0Hz' } = req.body;
  
  if (!texto || texto.trim() === '') {
    return res.status(400).json({ error: 'El texto es requerido' });
  }
  
  if (!VOCES[voz]) {
    return res.status(400).json({ error: 'Voz no válida', vocesDisponibles: Object.keys(VOCES) });
  }
  
  const vozName = VOCES[voz].name;
  const timestamp = Date.now();
  const outputFile = path.join(TEMP_DIR, `audio_${timestamp}.mp3`);
  
  // Escapar el texto para la línea de comandos
  const textoEscapado = texto.replace(/"/g, '\\"').replace(/\n/g, ' ');
  
  try {
    // Usar edge-tts CLI
    const bin = fs.existsSync(EDGE_BIN) ? `"${EDGE_BIN}"` : 'npx edge-tts';
    const comando = `${bin} --voice "${vozName}" --rate="${velocidad}" --pitch="${tono}" --text "${textoEscapado}" --write-media "${outputFile}"`;
    
    await execPromise(comando, { maxBuffer: 50 * 1024 * 1024 });
    
    // Verificar que el archivo existe
    if (!fs.existsSync(outputFile)) {
      throw new Error('No se pudo generar el audio');
    }
    
    // Enviar el archivo
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="tts_${timestamp}.mp3"`);
    
    const stream = fs.createReadStream(outputFile);
    stream.pipe(res);
    
    // Limpiar archivo después de enviar
    stream.on('end', () => {
      setTimeout(() => {
        fs.unlink(outputFile, () => {});
      }, 5000);
    });
    
  } catch (error) {
    console.error('Error TTS:', error);
    res.status(500).json({ error: 'Error generando audio', detalle: error.message });
  }
});

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🎙️  Servidor TTS corriendo en http://localhost:${PORT}`);
  console.log(`📋 ${Object.keys(VOCES).length} voces disponibles`);
});
