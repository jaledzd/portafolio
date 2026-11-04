
output "portfolio_bucket_name" {
  description = "Nombre del bucket S3 del portfolio"
  value       = aws_s3_bucket.portfolio.bucket
}

output "portfolio_bucket_arn" {
  description = "ARN del bucket S3"
  value       = aws_s3_bucket.portfolio.arn
}

output "portfolio_vpc_id" {
  description = "ID de la VPC del portfolio"
  value       = aws_vpc.portfolio.id
}

output "portfolio_vpc_cidr" {
  description = "Rango CIDR de la VPC"
  value       = aws_vpc.portfolio.cidr_block
}


output "portfolio_cloudfront_domain" {
  description = "Dominio publico HTTPS de CloudFront"
  value       = aws_cloudfront_distribution.portfolio.domain_name
}

output "portfolio_cloudfront_distribution_id" {
  description = "Identificador de la distribucion CloudFront"
  value       = aws_cloudfront_distribution.portfolio.id
}

output "portfolio_lambda_arn" {
  description = "ARN de la función Lambda de contacto"
  value       = aws_lambda_function.contacto.arn
}

output "portfolio_lambda_name" {
  description = "Nombre de la función Lambda"
  value       = aws_lambda_function.contacto.function_name
}

output "portfolio_api_url" {
  description = "URL publica de API Gateway"
  value       = aws_apigatewayv2_api.portfolio.api_endpoint
}

output "portfolio_api_contact_endpoint" {
  description = "Endpoint para enviar mensajes de contacto"
  value       = "${aws_apigatewayv2_api.portfolio.api_endpoint}/contacto"
}

output "portfolio_dynamodb_table_name" {
  description = "Nombre de la tabla de mensajes de contacto"
  value       = aws_dynamodb_table.contactos.name
}

output "portfolio_dynamodb_table_arn" {
  description = "ARN de la tabla de mensajes de contacto"
  value       = aws_dynamodb_table.contactos.arn
}