import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

function Accomp() {
    return (
        <div className="Accomps">
            <div className="Accomp1">
                <h2>2</h2>
                <h2>Alumni</h2>
                <p>Serving as ministers in the current government</p>
            </div>
            <div className="Accomp2">
                <FontAwesomeIcon icon={faArrowUp} style={{color: "#63E6BE",}} />
                <p>Increasing opportunities to pursue higher education</p>
            </div>
            <div className="Accomp3">
                <h2>68%</h2>
                <p>Increased literacy level of students from rural areas</p>
            </div>
        </div>
    );
}

export default Accomp;