import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * Hook pentru gestionarea chat-urilor AI
 * Salvează DOAR în Firestore - necesită autentificare
 */
export const useChats = () => {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Monitorizează starea de autentificare
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // Încarcă chat-urile când se schimbă utilizatorul
  useEffect(() => {
    if (user !== null) { // Așteaptă până când știm sigur dacă e logat sau nu
      loadChats();
    } else {
      // Dacă nu e logat, resetează chat-urile
      setChats([]);
      setCurrentChatId(null);
      setLoading(false);
    }
  }, [user]);

  /**
   * Încarcă chat-urile din Firestore
   */
  const loadChats = async () => {
    if (!user?.uid) {
      setChats([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      await loadChatsFromFirestore();
    } catch (error) {
      console.error('Error loading chats:', error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Încarcă chat-urile din Firestore cu TOATE mesajele
   */
  const loadChatsFromFirestore = async () => {
    if (!user?.uid) {
      throw new Error('User must be authenticated to load chats');
    }

    try {
      const chatsRef = collection(db, 'users', user.uid, 'chats');
      const q = query(chatsRef, orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const loadedChats = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        loadedChats.push({
          id: docSnapshot.id,
          title: data.title || `Chat ${new Date(data.createdAt || Date.now()).toLocaleDateString('ro-RO')}`,
          messages: Array.isArray(data.messages) ? data.messages : [],
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        });
      });

      console.log('✅ Loaded chats from Firestore:', loadedChats.length, 'chats');
      loadedChats.forEach(chat => {
        console.log(`  - Chat ${chat.id}: ${chat.messages?.length || 0} messages, title: "${chat.title}"`);
      });

      // Folosim setChats cu callback pentru a accesa valoarea curentă a currentChatId
      setChats(loadedChats);
      
      // Verifică și setează currentChatId după ce chats sunt setați
      setCurrentChatId(prevCurrentChatId => {
        if (loadedChats.length === 0) {
          // Nu există chat-uri, resetează selecția
          return null;
        }
        
        // Verifică dacă chat-ul curent selectat există în lista încărcată
        const currentChatExists = loadedChats.some(chat => chat.id === prevCurrentChatId);
        
        if (!prevCurrentChatId || !currentChatExists) {
          // Setează primul chat ca activ
          const firstChatId = loadedChats[0].id;
          console.log('✅ Set current chat to:', firstChatId);
          return firstChatId;
        } else {
          // Păstrează chat-ul curent selectat
          console.log('✅ Keeping current chat selected:', prevCurrentChatId);
          return prevCurrentChatId;
        }
      });
    } catch (error) {
      console.error('Error loading chats from Firestore:', error);
      throw error;
    }
  };

  /**
   * Creează un chat nou
   */
  const createChat = async (title = null) => {
    if (!user?.uid) {
      throw new Error('Trebuie să fii logat pentru a crea un chat');
    }

    const newChat = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 10),
      title: title || `Chat ${new Date().toLocaleDateString('ro-RO')}`,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      // Salvează în Firestore
      const chatRef = doc(db, 'users', user.uid, 'chats', newChat.id);
      await setDoc(chatRef, newChat);
      console.log('✅ Chat created in Firestore:', newChat.id, 'Title:', newChat.title);

      // Adaugă chat-ul nou la începutul listei și setează-l ca activ
      setChats(prev => [newChat, ...prev]);
      // Setează chat-ul nou ca activ DOAR dacă nu există deja unul selectat sau dacă este explicit cerut
      setCurrentChatId(newChat.id);
      return newChat.id;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  };

  /**
   * Actualizează un chat existent - salvează TOATE mesajele și titlul
   * @param {string} chatId - ID-ul chat-ului
   * @param {object|function} updates - Obiect cu actualizări sau funcție care returnează actualizări bazate pe chat-ul curent
   */
  const updateChat = async (chatId, updates) => {
    if (!user?.uid) {
      throw new Error('Trebuie să fii logat pentru a actualiza un chat');
    }

    try {
      // Obține versiunea cea mai recentă din Firestore pentru a fi sigur
      const chatRef = doc(db, 'users', user.uid, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      
      if (!chatDoc.exists()) {
        console.error('Chat not found in Firestore:', chatId);
        return;
      }

      const currentChatData = chatDoc.data();
      
      // Dacă updates este o funcție, o apelăm cu chat-ul curent din Firestore
      const actualUpdates = typeof updates === 'function' 
        ? updates({ id: chatId, ...currentChatData }) 
        : updates;

      // Construim chat-ul actualizat
      let updatedChat;
      if (actualUpdates.messages && Array.isArray(actualUpdates.messages)) {
        // Folosim direct messages din actualUpdates
        updatedChat = {
          ...currentChatData,
          ...actualUpdates,
          messages: actualUpdates.messages,
          updatedAt: new Date().toISOString()
        };
      } else {
        // Merge normal pentru celelalte câmpuri
        updatedChat = {
          ...currentChatData,
          ...actualUpdates,
          updatedAt: new Date().toISOString()
        };
      }

      // Actualizează state-ul local
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { id: chatId, ...updatedChat } : chat
      ));

      // Salvează în Firestore - folosim setDoc pentru a salva TOATE datele
      await setDoc(chatRef, updatedChat, { merge: true });
      console.log('✅ Chat updated in Firestore:', chatId, {
        title: updatedChat.title,
        messages: updatedChat.messages?.length || 0,
        updatedAt: updatedChat.updatedAt
      });
    } catch (error) {
      console.error('Error updating chat:', error);
      throw error;
    }
  };

  /**
   * Adaugă un mesaj la chat - salvează imediat în Firestore
   */
  const addMessage = async (chatId, message) => {
    if (!user?.uid) {
      throw new Error('Trebuie să fii logat pentru a adăuga un mesaj');
    }

    try {
      // Obține versiunea cea mai recentă din Firestore
      const chatRef = doc(db, 'users', user.uid, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      
      if (!chatDoc.exists()) {
        console.error('Chat not found in Firestore:', chatId);
        return;
      }

      const currentChatData = chatDoc.data();
      const currentMessages = Array.isArray(currentChatData.messages) ? currentChatData.messages : [];
      
      // Adaugă noul mesaj
      const updatedMessages = [...currentMessages, message];
      
      const updatedChat = {
        ...currentChatData,
        messages: updatedMessages,
        updatedAt: new Date().toISOString()
      };

      // Actualizează state-ul local
      setChats(prev => prev.map(c => 
        c.id === chatId ? { id: chatId, ...updatedChat } : c
      ));

      // Salvează în Firestore
      await setDoc(chatRef, updatedChat, { merge: true });
      console.log('✅ Message added and saved to Firestore:', chatId, {
        role: message.role,
        textLength: message.text?.length || 0,
        totalMessages: updatedMessages.length
      });
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  };

  /**
   * Șterge un chat
   */
  const deleteChat = async (chatId) => {
    if (!user?.uid) {
      throw new Error('Trebuie să fii logat pentru a șterge un chat');
    }

    try {
      // Șterge din Firestore
      const chatRef = doc(db, 'users', user.uid, 'chats', chatId);
      await deleteDoc(chatRef);
      console.log('✅ Chat deleted from Firestore:', chatId);

      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      // Dacă chat-ul șters era cel activ, selectează altul sau creează unul nou
      if (currentChatId === chatId) {
        setChats(prev => {
          if (prev.length > 0) {
            setCurrentChatId(prev[0].id);
          } else {
            setCurrentChatId(null);
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  };

  /**
   * Obține chat-ul curent
   */
  const getCurrentChat = () => {
    return chats.find(chat => chat.id === currentChatId);
  };

  return {
    chats,
    currentChatId,
    setCurrentChatId,
    loading,
    createChat,
    updateChat,
    addMessage,
    deleteChat,
    getCurrentChat,
    loadChats,
    user // Expunem user pentru a verifica dacă e logat
  };
};
