/**************************************************************

Chat

***************************************************************/
"use client";

import { useState, useEffect, useRef } from "react";
import { FaPaperPlane } from 'react-icons/fa';
import { 
  collection, 
  CollectionReference, 
  DocumentData, 
  DocumentReference,
  serverTimestamp,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  Timestamp

} from "firebase/firestore";
import { db } from "../../../firebase";
// import { Rings } from "react-loading-icons";
// import OpenAI from "openai";

import { useAuthUser } from '@/context/AppContext';

// 各部屋のメッセージの型
type MessageType = {
  text: string,
  sender: string,
  createdAt: Timestamp,
}


const Chat: React.FC = () => {
  const { selectedRoom, selectRoomName } = useAuthUser();
  // console.log(selectedRoom)

  // OPEN AIの初期化
  // const openai = new OpenAI({
  //   apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY,
  //   dangerouslyAllowBrowser: true, // ブラウザで表示する場合は危険なのでコンソールで見る場合はtrueにする
  // })
  // console.log(openai)

  // ローディングのステート
  // const [ isLoading, setIsLoading ] = useState<Boolean>(false);

  // 各部屋のメッセージのステート
  const [ messages, setMessages ] = useState<MessageType[]>([]);
  // console.log(messages)

  // inputのステート
  const [ inputMessage, setInputMessage ] = useState<string>("");
  const onChangeSetInputMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  }
  // console.log(inputMessage)

  /**************************************************************
  Firestoreにメッセージを保存
  ***************************************************************/
  const onSubmitSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!inputMessage.trim()) return;

    // 送信する参照を生成
    // roomsコレクションのドキュメント > サブコレクション(messages)を参照
    const roomDocRef = doc(db, "rooms", selectedRoom!);
    const messageCollectionRef = collection(
      roomDocRef, // どのコレクションのどのドキュメントか
      "messages"
    );

    // 追加するデータ...Firestorと合わせる
    const messageData = {
      text: inputMessage,
      sender: "user",
      createdAt: serverTimestamp(), // 投稿日時を決定できる
    }

    await addDoc(messageCollectionRef, messageData);

    setInputMessage("");

    // OpenAIからの返信...課金しないと使えない
    // const gpt3Response = await openai.chat.completions.create({
    //   messages: [{ role: "user", content: inputMessage }],
    //   model: "gpt-3.5-turbo",
    // });
    // console.log(gpt3Response);

    // const botResponse = gpt3Response.choices[0].message.content;
    
    // await addDoc(messageCollectionRef, {
    //   text: botResponse,
    //   sender: "bot",
    //   createdAt: serverTimestamp(),
    // })
  }

  /**************************************************************
  各部屋におけるメッセージを全て取得
  ***************************************************************/
  useEffect(() => {
    
    if(selectedRoom){ // 部屋がある場合のみ発火
      const fetchMessages = async () => {
        // setIsLoading(true);

        // roomsコレクションの中のドキュメント > サブコレクション(messages)を参照
        const roomDocRef = doc(db, "rooms", selectedRoom);
        const messageCollectionRef = collection(roomDocRef, "messages");

        // whereとorderByを同時に使う場合はFirebaseでindexをを登録する必要がある
        const q = query(messageCollectionRef, orderBy("createdAt"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          // console.log(snapshot); // QuerySnapshot{...} // 複数のドキュメントを保持
          // console.log(snapshot.docs); // [QueryDocumentSnapshot, QueryDocumentSnapshot] ...  ドキュメントのリスト

          // Firestoreから取得データを、MessageTypeとして型定義しつつ取得
          const messages = snapshot.docs.map(doc => doc.data() as MessageType);
          // console.log(messages)

          setMessages(messages);
        });

        // setIsLoading(false);

        // クリーンアップ関数...メモリリークを防ぐ
        // useEffectフック内でunsubscribe()を返すことで、コンポーネントがアンマウントされたときにこの関数が実行され、
        // onSnapshotリスナーが解除される。
        // これにより、アンマウントされたコンポーネントがリスナーを保持しなくなり、メモリリークを防ぐことができる
        return () => {
          unsubscribe();
        }
      }

      fetchMessages();
    }

  // selectedRoomが切り替わるたびに発火させる
  }, [ selectedRoom ]);
  
  /**************************************************************
  新しいメッセージが追加されたら一番下までスクロールさせる
  ***************************************************************/
 // スクロールさせたいDOMを取得
 // 取得したいDOM要素に、ref属性を付与
  const scrollDiv = useRef<HTMLDivElement>(null);
  // console.log(scrollDiv);

  useEffect(() => {
    if(scrollDiv.current){
      const element = scrollDiv.current;
      // console.dir(element);

      element.scrollTo({
        top: element.scrollHeight, // top: topをどこまでスクロールされるか。scrollHeight...要素の高さ文
        behavior: "smooth",
      })
    }

    // messagesの状態が切り替わるたびに発火せる
  }, [ messages ])

  return(
    <div className="bg-gray-500 h-full p-4 flex flex-col">
      <h1 className="text-2xl text-white font-semibold mb-4">{ selectRoomName ? selectRoomName : "部屋名" }</h1>
      
      <div className="flex-grow overflow-y-auto mb-4" ref={ scrollDiv }>
          {
            messages.map(( message, index ) => (
                <div 
                  key={ index }
                  className={ message.sender === "user" ? "text-right" : "text-left" }
                >
                  <div 
                    className={ 
                      message.sender === "user" ? "bg-blue-500 inline-block rounded px-4 py-2 mb-2" 
                                              : "bg-green-500 inline-block rounded px-4 py-2 mb-2"
                    }>
                      <p className="text-white">{ message.text }</p>
                  </div>
                </div>
            ))
          }

          {/* {isLoading && <Rings />} */}
      </div>

      <form 
        className="flex-shrink-0 relative"
        onSubmit={ onSubmitSendMessage }
      >
        <input 
          type="text" 
          className="border-2 rounded w-full pr-10 focus:outline-none p-2" 
          placeholder="メッセージを入力してください"
          value={ inputMessage }
          onChange={ onChangeSetInputMessage }
        />

        <button className="absolute inset-y-0 right-4 flex items-center">
          <FaPaperPlane />
        </button>
      </form>
      

    </div>
  )
}


export default Chat;