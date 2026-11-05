
variable "bucket_name" {
  description = "Bucket S3 donde se almacena la página web del portfolio"
  type        = string
  default     = "portfolio-jaledzd"
}

variable "vpc_cidr" {
  description = "Rango de direcciones IP de la VPC"
  type        = string
  default     = "10.0.0.0/16"
}

output "portfolio_sns_topic_arn" {
  description = "ARN del tema SNS para notificaciones de contacto"
  value       = data.aws_sns_topic.contacto.arn
}