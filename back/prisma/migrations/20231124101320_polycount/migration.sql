-- CreateTable
CREATE TABLE "Token" (
    "pk_token_id" SERIAL NOT NULL,
    "fk_utilisateur_id" INTEGER NOT NULL,
    "token" VARCHAR(200) NOT NULL,
    "type_verification" VARCHAR(20) NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_desactivation" TIMESTAMP(3) NOT NULL,
    "nombre_tentative" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("pk_token_id")
);

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_fk_utilisateur_id_fkey" FOREIGN KEY ("fk_utilisateur_id") REFERENCES "Utilisateur"("pk_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;
