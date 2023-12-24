function Selecteur({ label, options, valeur_defaut, changement }: SelecteurProps) {
    return (
      <div className="selecteur-container">
        <label>{label}</label>
        <select onChange={(e: any) => changement(e.target.value)}>
          {options.map(option => (
            valeur_defaut && valeur_defaut === option.value ?
            <option value={option.value} key={option.value} selected>
              {option.label}
            </option> :
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
  
interface SelecteurProps {
    label: string,
    options: {
        value: string,
        label: string
    }[],
    valeur_defaut: string | null,
    changement: Function
}

export default Selecteur;