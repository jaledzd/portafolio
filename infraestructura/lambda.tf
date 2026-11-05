# Comprimir el código de Lambda
data "archive_file" "lambda_contacto" {
  type        = "zip"
  source_file = "${path.module}/../backend/lambda/contact/dist/index.js"
  output_path = "${path.module}/../backend/lambda/contact/function.zip"
}

# Rol que permitirá a Lambda ejecutarse
resource "aws_iam_role" "lambda_contacto" {
  name = "portfolio-lambda-contact-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"

      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })

  tags = local.common_tags
}

# Permisos básicos para CloudWatch
resource "aws_iam_role_policy_attachment" "lambda_cloudwatch" {
  role = aws_iam_role.lambda_contacto.name

  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Función Lambda
resource "aws_lambda_function" "contacto" {
  environment {
    variables = {
      TABLA_CONTACTOS = aws_dynamodb_table.contactos.name
    }
  }

  function_name = "portfolio-contacto"

  role    = aws_iam_role.lambda_contacto.arn
  runtime = "nodejs22.x"
  handler = "index.handler"

  filename         = data.archive_file.lambda_contacto.output_path
  source_code_hash = data.archive_file.lambda_contacto.output_base64sha256

  memory_size = 256
  timeout     = 10

  tags = merge(local.common_tags, {
    Name = "portfolio-lambda-contacto"
  })

  depends_on = [
    aws_iam_role_policy_attachment.lambda_cloudwatch
  ]
}