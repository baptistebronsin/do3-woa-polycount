export function capitalize_name(name: string): string {
    // convertir le nom en minuscules
    const lowercaseName = name.toLowerCase();
  
    // diviser le nom en parties selon le caractère "-"
    const nameParts = lowercaseName.split('-');
  
    // capitaliser la première lettre de chaque partie du nom
    const capitalizedParts = nameParts.map((part) => {
      return part.charAt(0).toUpperCase() + part.slice(1);
    });
  
    // joindre les parties du nom avec le caractère "-" en supprimant les espaces
    return capitalizedParts.join('-').replace(/ - /g, '-');
}