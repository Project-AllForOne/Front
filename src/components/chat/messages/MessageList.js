import React, { memo, useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import LoadingDots from './LoadingDots';
import styles from '../../../css/chat/MessageList.module.css';

/**
 * 전체 메시지 목록과 스크롤 컨테이너를 관리하는 컴포넌트
 */
const MessageList = memo(({
    messages = [],                    
    isLoading = false,               
    highlightedMessageIndexes = [],   
    currentHighlightedIndex = null,   
    searchInput = '',                 
    openImageModal                    
}) => {
    const messageRefs = useRef([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (currentHighlightedIndex !== null && highlightedMessageIndexes?.length > 0) {
            const messageIndex = highlightedMessageIndexes[currentHighlightedIndex];
            if (messageRefs.current[messageIndex]) {
                messageRefs.current[messageIndex].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }, [currentHighlightedIndex, highlightedMessageIndexes]);

    return (
        <div className={styles.messageBox}>
            <div className={styles.messagesContainer}>
                {messages.map((message, index) => (
                    <div
                        key={message.id || index}
                        ref={el => messageRefs.current[index] = el}
                        id={`message-${index}`}
                        className={`${styles.message} ${
                            message.type === 'USER' ? styles.userMessage : styles.botMessage
                        } ${
                            highlightedMessageIndexes?.includes(index) ? styles.highlightedMessage : ''
                        }`}
                    >
                        <MessageItem
                            message={message}
                            isHighlighted={highlightedMessageIndexes?.includes(index)}
                            searchInput={searchInput}
                            openModal={openImageModal}
                            color={message.color}
                        />
                    </div>
                ))}
                {isLoading && <LoadingDots />}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
});

MessageList.displayName = 'MessageList';
export default MessageList;
