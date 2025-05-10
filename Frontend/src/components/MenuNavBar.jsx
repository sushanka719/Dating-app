import { useNavigate } from 'react-router-dom';
import styles from '../styles/MenuNavBar.module.css'

const MenuNavBar = ({ title, onClose, setOption}) => {
    const navigate = useNavigate();

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
        navigate('/dating-app');
        setOption(false)
    };

    return (
        <div className={styles.navbar}>
            <div className={styles.center}>
                {title}
            </div>
            <div className={styles.right}>
                <button onClick={handleClose} className={styles.closeBtn}>✖</button>
            </div>
        </div>
    );
};

export default MenuNavBar;
