
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2
} from "aws-lambda";

import { randomUUID } from "node:crypto";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand
} from "@aws-sdk/lib-dynamodb";

import {
  SNSClient,
  PublishCommand
} from "@aws-sdk/client-sns";

// Variables de entorno de Lambda
const nombreTabla = process.env.TABLA_CONTACTOS;
const arnTemaSNS = process.env.TOPIC_ARN;

// Cliente para comunicarnos con DynamoDB
const clienteDynamoDB = DynamoDBDocumentClient.from(
  new DynamoDBClient({})
);

// Cliente para comunicarnos con SNS
const clienteSNS = new SNSClient({});

// Estructura de los datos recibidos del formulario
interface DatosContacto {
  nombre: string;
  email: string;
  mensaje: string;
}

// Construir respuestas HTTP para API Gateway
const crearRespuesta = (
  codigoEstado: number,
  contenido: object
): APIGatewayProxyResultV2 => ({
  statusCode: codigoEstado,
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(contenido)
});

// Función principal de Lambda
export const handler = async (
  evento: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {

  // Comprobar que los recursos están configurados
  if (!nombreTabla || !arnTemaSNS) {
    console.error("Falta configurar TABLA_CONTACTOS o TOPIC_ARN.");

    return crearRespuesta(500, {
      exito: false,
      mensaje: "Error de configuración del servidor."
    });
  }

  // Comprobar que se han recibido datos
  if (!evento.body) {
    return crearRespuesta(400, {
      exito: false,
      mensaje: "No se han recibido datos."
    });
  }

  let datosRecibidos: unknown;

  try {
    // Decodificar el contenido si llega en Base64
    const contenidoRecibido = evento.isBase64Encoded
      ? Buffer.from(evento.body, "base64").toString("utf-8")
      : evento.body;

    datosRecibidos = JSON.parse(contenidoRecibido);

  } catch {
    return crearRespuesta(400, {
      exito: false,
      mensaje: "El contenido recibido no es un JSON válido."
    });
  }

  // Comprobar que los datos tienen una estructura válida
  if (
    typeof datosRecibidos !== "object" ||
    datosRecibidos === null ||
    Array.isArray(datosRecibidos)
  ) {
    return crearRespuesta(400, {
      exito: false,
      mensaje: "El formato de los datos no es válido."
    });
  }

  const contacto = datosRecibidos as Record<string, unknown>;

  // Validar que todos los campos sean texto
  const campos = [
    contacto.nombre,
    contacto.email,
    contacto.mensaje
  ];

  if (!campos.every((campo) => typeof campo === "string")) {
    return crearRespuesta(400, {
      exito: false,
      mensaje: "Todos los campos deben contener texto."
    });
  }

  const datos: DatosContacto = {
    nombre: (contacto.nombre as string).trim(),
    email: (contacto.email as string).trim(),
    mensaje: (contacto.mensaje as string).trim()
  };

  // Comprobar que los campos no estén vacíos
  if (!datos.nombre || !datos.email || !datos.mensaje) {
    return crearRespuesta(400, {
      exito: false,
      mensaje: "Todos los campos son obligatorios."
    });
  }

  // Limitar la longitud de los campos
  if (
    datos.nombre.length > 100 ||
    datos.email.length > 254 ||
    datos.mensaje.length > 5000
  ) {
    return crearRespuesta(400, {
      exito: false,
      mensaje: "Uno o varios campos superan la longitud permitida."
    });
  }

  // Validar el formato del correo electrónico
  const expresionCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!expresionCorreo.test(datos.email)) {
    return crearRespuesta(400, {
      exito: false,
      mensaje: "El correo electrónico no es válido."
    });
  }

  try {
    // Crear el registro que guardaremos en DynamoDB
    const nuevoContacto = {
      id: randomUUID(),
      nombre: datos.nombre,
      email: datos.email,
      mensaje: datos.mensaje,
      fechaRecepcion: new Date().toISOString()
    };

    // 1. Guardar el mensaje en DynamoDB
    await clienteDynamoDB.send(
      new PutCommand({
        TableName: nombreTabla,
        Item: nuevoContacto
      })
    );

    console.log("Mensaje guardado correctamente en DynamoDB.");

    // 2. Preparar el contenido del correo
    const contenidoCorreo = [
      "Has recibido un nuevo mensaje desde tu portfolio.",
      "",
      `Nombre: ${nuevoContacto.nombre}`,
      `Correo electrónico: ${nuevoContacto.email}`,
      "",
      "Mensaje:",
      nuevoContacto.mensaje,
      "",
      `Fecha de recepción: ${nuevoContacto.fechaRecepcion}`,
      `Identificador: ${nuevoContacto.id}`
    ].join("\n");

    // 3. Enviar la notificación mediante SNS
    await clienteSNS.send(
      new PublishCommand({
        TopicArn: arnTemaSNS,
        Subject: "Nuevo mensaje desde tu portfolio",
        Message: contenidoCorreo
      })
    );

    console.log("Notificación enviada correctamente mediante SNS.");

    // 4. Responder a API Gateway
    return crearRespuesta(200, {
      exito: true,
      mensaje: "Tu mensaje se ha recibido correctamente.",
      id: nuevoContacto.id
    });

  } catch (error) {
    console.error("Error al procesar el contacto:", error);

    return crearRespuesta(500, {
      exito: false,
      mensaje: "Tu mensaje se ha guardado o procesado con un error de notificación. Comprueba los registros."
    });
  }
};
