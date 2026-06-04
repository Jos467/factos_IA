-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('INGRESO', 'GASTO');

-- CreateEnum
CREATE TYPE "EstadoFactura" AS ENUM ('BORRADOR', 'COMPLETA', 'ENVIADA');

-- CreateEnum
CREATE TYPE "EstadoEnvio" AS ENUM ('PENDIENTE', 'ENVIADO', 'FALLIDO');

-- CreateEnum
CREATE TYPE "MedioEnvio" AS ENUM ('WHATSAPP', 'EMAIL', 'OTRO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100),
    "email" VARCHAR(150),
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "telefono" VARCHAR(20),
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "categorias_gasto" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "icono" VARCHAR(50),
    "color" VARCHAR(20),
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "categorias_gasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_documento" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "tipos_documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "rtn" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoriaId" INTEGER,
    "tipoDocumentoId" INTEGER,
    "proveedorId" INTEGER,
    "proveedorTexto" VARCHAR(200),
    "fecha" DATE,
    "monto" DECIMAL(10,2) NOT NULL,
    "moneda" VARCHAR(5) NOT NULL DEFAULT 'HNL',
    "numeroFactura" VARCHAR(100),
    "facturaFisica" BOOLEAN NOT NULL DEFAULT false,
    "tipoMovimiento" "TipoMovimiento" NOT NULL DEFAULT 'GASTO',
    "archivoUrl" VARCHAR(500),
    "archivoTipo" VARCHAR(20),
    "datosConfirmados" BOOLEAN NOT NULL DEFAULT false,
    "ocrRaw" JSONB,
    "mes" INTEGER,
    "anio" INTEGER,
    "observaciones" TEXT,
    "estado" "EstadoFactura" NOT NULL DEFAULT 'BORRADOR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "envios" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "destinatario" VARCHAR(200) NOT NULL,
    "medioEnvio" "MedioEnvio" NOT NULL,
    "estado" "EstadoEnvio" NOT NULL DEFAULT 'PENDIENTE',
    "mes" INTEGER,
    "anio" INTEGER,
    "archivoResumenUrl" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "envios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "envio_facturas" (
    "id" TEXT NOT NULL,
    "envioId" TEXT NOT NULL,
    "facturaId" TEXT NOT NULL,

    CONSTRAINT "envio_facturas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "facturas_userId_idx" ON "facturas"("userId");

-- CreateIndex
CREATE INDEX "facturas_userId_mes_anio_idx" ON "facturas"("userId", "mes", "anio");

-- CreateIndex
CREATE UNIQUE INDEX "envio_facturas_envioId_facturaId_key" ON "envio_facturas"("envioId", "facturaId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias_gasto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_tipoDocumentoId_fkey" FOREIGN KEY ("tipoDocumentoId") REFERENCES "tipos_documento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envios" ADD CONSTRAINT "envios_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envio_facturas" ADD CONSTRAINT "envio_facturas_envioId_fkey" FOREIGN KEY ("envioId") REFERENCES "envios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envio_facturas" ADD CONSTRAINT "envio_facturas_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "facturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
