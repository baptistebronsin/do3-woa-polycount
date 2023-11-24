-- CreateTable
CREATE TABLE "Utilisateur" (
    "pk_utilisateur_id" SERIAL NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "prenom" VARCHAR(50) NOT NULL,
    "genre" VARCHAR(4),
    "email" VARCHAR(250) NOT NULL,
    "mot_de_passe" TEXT NOT NULL,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valide_le" TIMESTAMP(3),
    "token" VARCHAR(200) NOT NULL,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("pk_utilisateur_id")
);

-- CreateTable
CREATE TABLE "Groupe" (
    "pk_groupe_id" SERIAL NOT NULL,
    "nom" VARCHAR(50),
    "description" VARCHAR(200),
    "fk_utilisateur_createur_id" INTEGER NOT NULL,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cloture_le" TIMESTAMP(3),
    "lien_image" TEXT,

    CONSTRAINT "Groupe_pkey" PRIMARY KEY ("pk_groupe_id")
);

-- CreateTable
CREATE TABLE "Participant_Groupe" (
    "pk_participant_groupe_id" SERIAL NOT NULL,
    "fk_utilisateur_id" INTEGER NOT NULL,
    "fk_groupe_id" INTEGER NOT NULL,
    "peut_creer_depense" BOOLEAN NOT NULL,
    "peut_modifier_depense" BOOLEAN NOT NULL,
    "peut_supprimer_depense" BOOLEAN NOT NULL,
    "peut_manipuler_tag" BOOLEAN NOT NULL,
    "peut_modifier_montant_max_depense" BOOLEAN NOT NULL,
    "montant_max_depense" DOUBLE PRECISION,
    "rejoint_le" TIMESTAMP(3),
    "quitte_le" TIMESTAMP(3),

    CONSTRAINT "Participant_Groupe_pkey" PRIMARY KEY ("pk_participant_groupe_id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "pk_tag_id" SERIAL NOT NULL,
    "titre" VARCHAR(40) NOT NULL,
    "couleur" VARCHAR(6) NOT NULL,
    "icon" VARCHAR(50) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("pk_tag_id")
);

-- CreateTable
CREATE TABLE "Depense" (
    "pk_depense_id" SERIAL NOT NULL,
    "fk_groupe_id" INTEGER NOT NULL,
    "fk_utilisateur_createur_id" INTEGER NOT NULL,
    "titre" VARCHAR(100),
    "montant" DOUBLE PRECISION NOT NULL,
    "ajoute_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lien_image" TEXT,

    CONSTRAINT "Depense_pkey" PRIMARY KEY ("pk_depense_id")
);

-- CreateTable
CREATE TABLE "Utilisateur_Liee_Depense" (
    "fk_utilisateur_id" INTEGER NOT NULL,
    "fk_depense_id" INTEGER NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Utilisateur_Liee_Depense_pkey" PRIMARY KEY ("fk_utilisateur_id","fk_depense_id")
);

-- CreateTable
CREATE TABLE "Suspension" (
    "pk_suspension_id" SERIAL NOT NULL,
    "fk_utilisateur_id" INTEGER NOT NULL,
    "date_ajout" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message_utilisateur" VARCHAR(300),
    "message_admin" VARCHAR(300),
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3),

    CONSTRAINT "Suspension_pkey" PRIMARY KEY ("pk_suspension_id")
);

-- CreateTable
CREATE TABLE "_TagDepense" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_TagDepense_AB_unique" ON "_TagDepense"("A", "B");

-- CreateIndex
CREATE INDEX "_TagDepense_B_index" ON "_TagDepense"("B");

-- AddForeignKey
ALTER TABLE "Groupe" ADD CONSTRAINT "Groupe_fk_utilisateur_createur_id_fkey" FOREIGN KEY ("fk_utilisateur_createur_id") REFERENCES "Utilisateur"("pk_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant_Groupe" ADD CONSTRAINT "Participant_Groupe_fk_utilisateur_id_fkey" FOREIGN KEY ("fk_utilisateur_id") REFERENCES "Utilisateur"("pk_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant_Groupe" ADD CONSTRAINT "Participant_Groupe_fk_groupe_id_fkey" FOREIGN KEY ("fk_groupe_id") REFERENCES "Groupe"("pk_groupe_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Depense" ADD CONSTRAINT "Depense_fk_groupe_id_fkey" FOREIGN KEY ("fk_groupe_id") REFERENCES "Groupe"("pk_groupe_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Depense" ADD CONSTRAINT "Depense_fk_utilisateur_createur_id_fkey" FOREIGN KEY ("fk_utilisateur_createur_id") REFERENCES "Utilisateur"("pk_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utilisateur_Liee_Depense" ADD CONSTRAINT "Utilisateur_Liee_Depense_fk_utilisateur_id_fkey" FOREIGN KEY ("fk_utilisateur_id") REFERENCES "Utilisateur"("pk_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utilisateur_Liee_Depense" ADD CONSTRAINT "Utilisateur_Liee_Depense_fk_depense_id_fkey" FOREIGN KEY ("fk_depense_id") REFERENCES "Depense"("pk_depense_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suspension" ADD CONSTRAINT "Suspension_fk_utilisateur_id_fkey" FOREIGN KEY ("fk_utilisateur_id") REFERENCES "Utilisateur"("pk_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagDepense" ADD CONSTRAINT "_TagDepense_A_fkey" FOREIGN KEY ("A") REFERENCES "Depense"("pk_depense_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagDepense" ADD CONSTRAINT "_TagDepense_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("pk_tag_id") ON DELETE CASCADE ON UPDATE CASCADE;
