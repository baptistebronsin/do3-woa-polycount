export function genre_utilisateur(genre: string | null): string {
    switch (genre) {
        case "M": return "Monsieur"
        case "Mme": return "Madame"
        case "M": return "Monsieur"
        default: return ""
    }
}