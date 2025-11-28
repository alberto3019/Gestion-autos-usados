#!/bin/bash

# Script para actualizar la contraseña de Supabase en el archivo .env

if [ -z "$1" ]; then
  echo "❌ Error: Debes proporcionar la contraseña de Supabase"
  echo ""
  echo "Uso: ./update-db-password.sh TU_PASSWORD"
  echo ""
  echo "Ejemplo:"
  echo "  ./update-db-password.sh mi_password_secreto"
  exit 1
fi

PASSWORD="$1"
ESCAPED_PASSWORD=$(echo "$PASSWORD" | sed 's/[[\.*^$()+?{|]/\\&/g')

# Actualizar el archivo .env
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s/\[TU_PASSWORD\]/$ESCAPED_PASSWORD/g" .env
else
  # Linux
  sed -i "s/\[TU_PASSWORD\]/$ESCAPED_PASSWORD/g" .env
fi

echo "✅ Contraseña actualizada en el archivo .env"
echo ""
echo "Ahora puedes probar la conexión con:"
echo "  npm run prisma:generate"
echo "  npm run prisma:migrate"

