import React from 'react';
import styles from '../../css/shop/NotificationBadge.module.css';

function NotificationBadge({ count, show = false, type = 'wishlist' }) {
    if (!show || count === 0) return null;

    return (
        <div className={styles.badge} data-badge={type}>
            {count > 99 ? '99+' : count}
        </div>
    );
}

export default NotificationBadge;
