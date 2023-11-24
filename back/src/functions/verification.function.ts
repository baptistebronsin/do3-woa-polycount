export function date_valide(date: string): boolean {
    return !isNaN(new Date(date).getTime());
}

export function temps_valide(temps: string): boolean {
    const formule_regex: RegExp = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;

    return formule_regex.test(temps);
}

export function email_valide(email: string): boolean {
    const formule_regex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return formule_regex.test(email);
}

export function genre_valide(genre: string | null): boolean {
    const liste_genre: string[] = ['M', 'Mme', 'Mlle'];

    return genre == null || liste_genre.includes(genre);
}