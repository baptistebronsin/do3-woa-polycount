import LoaderSpinner from "./loader_spinner.component";

function LoaderCenter ({ message }: { message: string }) {

    return (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <LoaderSpinner />
            <p className="inline-block">&nbsp;{ message }</p>
        </div>
    );
}

export default LoaderCenter;