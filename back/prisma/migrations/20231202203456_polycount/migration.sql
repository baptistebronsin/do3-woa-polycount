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
    "desactive_le" TIMESTAMP(3),
    "stripe_customer_id" VARCHAR(200) NOT NULL,

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
CREATE TABLE "Token" (
    "pk_token_id" SERIAL NOT NULL,
    "fk_utilisateur_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "type_verification" VARCHAR(20) NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_desactivation" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("pk_token_id")
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
CREATE TABLE "Caracteristique_Abonnement" (
    "pk_caracteristique_abonnement_id" SERIAL NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "description" VARCHAR(300),
    "nombre_max_groupe" INTEGER,
    "nombre_max_participant_par_groupe" INTEGER,
    "nombre_max_depense_par_groupe" INTEGER,
    "couleur_clair" VARCHAR(8),
    "couleur_sombre" VARCHAR(8),
    "stripe_product_id" VARCHAR(200) NOT NULL,

    CONSTRAINT "Caracteristique_Abonnement_pkey" PRIMARY KEY ("pk_caracteristique_abonnement_id")
);

-- CreateTable
CREATE TABLE "Abonnement" (
    "pk_abonnement_id" SERIAL NOT NULL,
    "fk_caracteristique_abonnement_id" INTEGER NOT NULL,
    "prix" DOUBLE PRECISION NOT NULL,
    "periodicite" VARCHAR(13) NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_fin" TIMESTAMP(3),
    "stripe_price_id" VARCHAR(200) NOT NULL,

    CONSTRAINT "Abonnement_pkey" PRIMARY KEY ("pk_abonnement_id")
);

-- CreateTable
CREATE TABLE "Code_Reduction" (
    "pk_code_reduction_id" SERIAL NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "fk_abonnement_id" INTEGER NOT NULL,
    "description" VARCHAR(300) NOT NULL,
    "reduction" DOUBLE PRECISION NOT NULL,
    "duree_reduction" INTEGER NOT NULL,
    "est_utilisable" BOOLEAN NOT NULL,
    "nombre_maximum_utilisation" INTEGER NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3),
    "stripe_coupon_id" VARCHAR(200) NOT NULL,
    "stripe_promotion_id" VARCHAR(200) NOT NULL,

    CONSTRAINT "Code_Reduction_pkey" PRIMARY KEY ("pk_code_reduction_id")
);

-- CreateTable
CREATE TABLE "Offre_Speciale" (
    "pk_offre_speciale_id" SERIAL NOT NULL,
    "fk_caracteristique_abonnement_id" INTEGER NOT NULL,
    "description_offre_speciale" VARCHAR(300) NOT NULL,
    "pourcentage_annonce" INTEGER NOT NULL,
    "prix_reduit" DOUBLE PRECISION NOT NULL,
    "duree_reduction" INTEGER NOT NULL,
    "nombre_maximum_utilisation" INTEGER,
    "date_debut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_fin" TIMESTAMP(3),
    "stripe_coupon_id" VARCHAR(200) NOT NULL,

    CONSTRAINT "Offre_Speciale_pkey" PRIMARY KEY ("pk_offre_speciale_id")
);

-- CreateTable
CREATE TABLE "Souscription_Abonnement" (
    "pk_souscription_abonnement_id" SERIAL NOT NULL,
    "fk_utilisateur_id" INTEGER NOT NULL,
    "fk_abonnement_id" INTEGER NOT NULL,
    "fk_code_reduction_id" INTEGER,
    "fk_offre_speciale_id" INTEGER,
    "date_souscription_abonnement" TIMESTAMP(3) NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3),
    "stripe_subscription_id" VARCHAR(200) NOT NULL,

    CONSTRAINT "Souscription_Abonnement_pkey" PRIMARY KEY ("pk_souscription_abonnement_id")
);

-- CreateTable
CREATE TABLE "Paiement_Abonnement" (
    "pk_paiement_abonnement_id" SERIAL NOT NULL,
    "fk_souscription_abonnement_id" INTEGER NOT NULL,
    "prix_paye" DOUBLE PRECISION NOT NULL,
    "date_paiement" TIMESTAMP(3) NOT NULL,
    "etat" VARCHAR(20) NOT NULL,
    "moyen_paiement" VARCHAR(20) NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paiement_Abonnement_pkey" PRIMARY KEY ("pk_paiement_abonnement_id")
);

-- CreateTable
CREATE TABLE "_TagDepense" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Code_Reduction_code_key" ON "Code_Reduction"("code");

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
ALTER TABLE "Token" ADD CONSTRAINT "Token_fk_utilisateur_id_fkey" FOREIGN KEY ("fk_utilisateur_id") REFERENCES "Utilisateur"("pk_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suspension" ADD CONSTRAINT "Suspension_fk_utilisateur_id_fkey" FOREIGN KEY ("fk_utilisateur_id") REFERENCES "Utilisateur"("pk_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Abonnement" ADD CONSTRAINT "Abonnement_fk_caracteristique_abonnement_id_fkey" FOREIGN KEY ("fk_caracteristique_abonnement_id") REFERENCES "Caracteristique_Abonnement"("pk_caracteristique_abonnement_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Code_Reduction" ADD CONSTRAINT "Code_Reduction_fk_abonnement_id_fkey" FOREIGN KEY ("fk_abonnement_id") REFERENCES "Abonnement"("pk_abonnement_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offre_Speciale" ADD CONSTRAINT "Offre_Speciale_fk_caracteristique_abonnement_id_fkey" FOREIGN KEY ("fk_caracteristique_abonnement_id") REFERENCES "Caracteristique_Abonnement"("pk_caracteristique_abonnement_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Souscription_Abonnement" ADD CONSTRAINT "Souscription_Abonnement_fk_utilisateur_id_fkey" FOREIGN KEY ("fk_utilisateur_id") REFERENCES "Utilisateur"("pk_utilisateur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Souscription_Abonnement" ADD CONSTRAINT "Souscription_Abonnement_fk_abonnement_id_fkey" FOREIGN KEY ("fk_abonnement_id") REFERENCES "Abonnement"("pk_abonnement_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Souscription_Abonnement" ADD CONSTRAINT "Souscription_Abonnement_fk_code_reduction_id_fkey" FOREIGN KEY ("fk_code_reduction_id") REFERENCES "Code_Reduction"("pk_code_reduction_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Souscription_Abonnement" ADD CONSTRAINT "Souscription_Abonnement_fk_offre_speciale_id_fkey" FOREIGN KEY ("fk_offre_speciale_id") REFERENCES "Offre_Speciale"("pk_offre_speciale_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement_Abonnement" ADD CONSTRAINT "Paiement_Abonnement_fk_souscription_abonnement_id_fkey" FOREIGN KEY ("fk_souscription_abonnement_id") REFERENCES "Souscription_Abonnement"("pk_souscription_abonnement_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagDepense" ADD CONSTRAINT "_TagDepense_A_fkey" FOREIGN KEY ("A") REFERENCES "Depense"("pk_depense_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagDepense" ADD CONSTRAINT "_TagDepense_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("pk_tag_id") ON DELETE CASCADE ON UPDATE CASCADE;
