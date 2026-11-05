# API Gateway HTTP API
resource "aws_apigatewayv2_api" "portfolio" {
  name          = "portfolio-contact-api"
  protocol_type = "HTTP"

  description = "API para el formulario de contacto del portfolio"

  # Permitir peticiones desde nuestro frontend en CloudFront
  cors_configuration {
    allow_origins = [
      "https://${aws_cloudfront_distribution.portfolio.domain_name}"
    ]

    allow_methods = ["POST", "OPTIONS"]

    allow_headers = ["content-type"]

    max_age = 300
  }

  tags = local.common_tags
}

# Integración entre API Gateway y Lambda
resource "aws_apigatewayv2_integration" "lambda_contacto" {
  api_id = aws_apigatewayv2_api.portfolio.id

  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.contacto.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

# Ruta para recibir los mensajes
resource "aws_apigatewayv2_route" "contacto" {
  api_id    = aws_apigatewayv2_api.portfolio.id
  route_key = "POST /contacto"

  target = "integrations/${aws_apigatewayv2_integration.lambda_contacto.id}"
}

# Etapa de producción con despliegue automático
resource "aws_apigatewayv2_stage" "produccion" {
  api_id      = aws_apigatewayv2_api.portfolio.id
  name        = "$default"
  auto_deploy = true

  # Límites de solicitudes para proteger la API
  default_route_settings {
    throttling_burst_limit = 5
    throttling_rate_limit  = 2
  }

  tags = local.common_tags
}

# Permitir que API Gateway invoque Lambda
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowApiGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.contacto.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.portfolio.execution_arn}/*/POST/contacto"
}