import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tag } from "../../models/tag.model";
import { faPlane, faUtensils, faHome, faHiking, faQuestion } from "@fortawesome/free-solid-svg-icons";

function PastilleTag ({ tag }: { tag: Tag }) {
    const iconsMap = { faPlane, faUtensils, faHome, faHiking, faQuestion }

    return (
        <p style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '2px solid #' + tag.couleur, backgroundColor: 'rgba(222, 222, 222, 0.2)', borderRadius: '10px', padding: '4px 8px', color: 'black' }}>
            <span>{ tag.titre }</span>
            <FontAwesomeIcon style={{ color: '#' + tag.couleur }} icon={iconsMap[tag.icon as keyof typeof iconsMap]} />
        </p>
    );
}

export default PastilleTag;