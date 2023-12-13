import { useId } from "react";

function TextInput({ label, ...props }: any) {
    const id: string = useId();

    return (
        <div className="input-container">
            <input id={id} {...props} spellcheck="false" />
            <label htmlFor={id}>{label}</label>
        </div>
    );
}

export default TextInput;