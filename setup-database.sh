#!/bin/bash

echo "🚀 Configurando base de datos para el Gestor de Contraseñas"
echo "=========================================================="

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker Desktop primero."
    echo "   Visita: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

echo "✅ Docker está instalado"

# Verificar si Docker está ejecutándose
if ! docker info &> /dev/null; then
    echo "❌ Docker no está ejecutándose. Por favor inicia Docker Desktop."
    exit 1
fi

echo "✅ Docker está ejecutándose"

# Iniciar SQL Server
echo "🐳 Iniciando SQL Server..."
docker-compose up -d

# Esperar a que SQL Server esté listo
echo "⏳ Esperando a que SQL Server esté listo..."
sleep 30

# Verificar que el contenedor esté ejecutándose
if ! docker ps | grep -q password-manager-db; then
    echo "❌ Error: El contenedor de SQL Server no está ejecutándose"
    exit 1
fi

echo "✅ SQL Server está ejecutándose"

# Instalar sqlcmd si no está disponible
if ! command -v sqlcmd &> /dev/null; then
    echo "📦 Instalando sqlcmd..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install mssql-tools
        else
            echo "❌ Homebrew no está instalado. Por favor instala Homebrew primero."
            echo "   Visita: https://brew.sh/"
            exit 1
        fi
    fi
fi

echo "✅ sqlcmd está disponible"

# Ejecutar el script de inicialización
echo "📝 Ejecutando script de inicialización..."
if command -v sqlcmd &> /dev/null; then
    sqlcmd -S localhost,1433 -U sa -P "PasswordManager123!" -i database/init.sql
    echo "✅ Base de datos configurada correctamente"
else
    echo "⚠️  sqlcmd no está disponible. Ejecuta manualmente:"
    echo "   sqlcmd -S localhost,1433 -U sa -P 'PasswordManager123!' -i database/init.sql"
fi

echo ""
echo "🎉 ¡Base de datos configurada exitosamente!"
echo "=========================================="
echo "📊 Servidor: localhost:1433"
echo "👤 Usuario: sa"
echo "🔑 Contraseña: PasswordManager123!"
echo "🗄️  Base de datos: PasswordManager"
echo ""
echo "🚀 Ahora puedes ejecutar: npm run dev"
