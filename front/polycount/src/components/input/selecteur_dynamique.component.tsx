function SelecteurDynamique ({ options, defaut, changement }: { options: { valeur: number, label: string }[], defaut: number, changement: Function }) {

    return (
        <div className="selecteur-dynamique">
            <div className="container">
            {
                options.map((o: { valeur: number, label: string }, index: number) => {
                    return (
                        <p className={"element" + (o.valeur === defaut ? "-actif" : "")} key={ index } onClick={ () => changement(o.valeur) } >{ o.label }</p>
                    );
                })
            }
            </div>
        </div>
    );
}

export default SelecteurDynamique;