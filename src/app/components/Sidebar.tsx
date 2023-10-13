/**************************************************************

Sidebar

***************************************************************/
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BiLogOut } from "react-icons/bi";
import { Timestamp, collection, onSnapshot, orderBy, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";
import { auth } from "../../../firebase";

import { useAuthUser } from "@/context/AppContext";

type Room = {
  id: string,
  name: string,
  createdAt: Timestamp,
}


const Sidebar: React.FC = () => {
  // コンテキストから取得
  const { user, userId, setSelectedRoom, setSelectRoomName } = useAuthUser();
  // console.log(user, userId)

  const router = useRouter();

  const [ rooms, setRooms ] = useState<Room[]>([]);

  /**************************************************************
  roomコレクションのドキュメントをログインしているユーザーが投稿したドキュメントだけ取得
  ***************************************************************/
  useEffect(() => {
    if(user){ // ユーザーが取得できた時だけ発火
      const fetchRooms = async () => {
        
        // コレクションへの参照
        const roomCollectionRef = collection(db, "rooms");

        // 参照を元にroomsのドキュメントを投稿日時順に取得してクエリを作成
        // whereとorderByを同時に使う場合はFirebaseでindexをを登録する必要がある
        const q = query(
          roomCollectionRef, 
          // Todo: 動的にする?
          where("userId", "==", userId), // ログインしているユーザーが書いたドキュメントのみ取得
          orderBy("createdAt")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          // console.log(snapshot); // QuerySnapshot{...} // 複数のドキュメントを保持
          // console.log(snapshot.docs); // [QueryDocumentSnapshot, QueryDocumentSnapshot] ...  ドキュメントのリスト

          const newRooms: Room[] = snapshot.docs.map(doc => {
            // console.log(doc); // QueryDocumentSnapshot
            
            // Firestoreは、内部でid、data()など特別なプロパティとメソッドを提供していて、簡単にデータにアクセスできる
            return {
              id: doc.id,    // doc.idとすることで、そのドキュメントのidにアクセスできる仕様
              name: doc.data().name,
              createdAt: doc.data().createdAt,
              // ...doc.data(), // {createdAt, name, userId}。data()... どのドキュメントにアクセスできる関数
            }
          });
          // console.log(newRooms); // { id, createdAt, name, userId }

          setRooms(newRooms);
        });

        // unsubscribe...クリーンアップ関数
        // useEffectフック内でunsubscribe()を返すことで、コンポーネントがアンマウントされたときにこの関数が実行され、
        // onSnapshotが解除される。
        // これにより、アンマウントされたコンポーネントがリスナーを保持しなくなり、メモリリークを防ぐことができる
        return () => {
          unsubscribe();
        }
      }

      fetchRooms();
    }

    // ログインしているユーザーが切り替われば発火
  }, [ userId ])

  // ドキュメントのidとnameをグローバルに管理
  const onClickSelectRoom = (room_id: string, room_name: string) => {
    
    setSelectedRoom(room_id);
    setSelectRoomName(room_name);
  }

  /**************************************************************
  新しい部屋を作る
  ***************************************************************/
  const onClickAddNewRoom = async () => {
    const roomName = prompt("ルーム名を入力してください");

    if(roomName){
      // コレクションへの参照
      const newRoomRef = collection(db, "rooms");

      await addDoc(newRoomRef, {
        // ドキュメントのidは自動で付与される
        name: roomName,
        userId: userId, // 認証で取得したユーザーid
        createdAt: serverTimestamp(),
      })
    }
  }

  // サインアウト
  const onClickSignOut = () => {
    auth.signOut();

    router.push("/auth/login");
  }

  return(
    <div className="h-full overflow-y-auto px-5 flex flex-col bg-custom-blue">
      <div className="flex-grow">
        <div 
          className="cursor-pointer flex justify-evenly items-center border mt-2 rounded-md hover:bg-blue-800 duration-150"
          onClick={ () => onClickAddNewRoom() }
        >
          <span className="text-white p-4 tet-2xl">＋</span>
          <h1 className="text-white text-xl font-semibold p-4">New Chat</h1>
        </div>

        <ul className="">
          {
            rooms.map(room => (
              <li
                key={ room.id }
                className="cursor-pointer p-4 text-slate-100 border-b hover:bg-slate-700 duration-150"
                onClick={ () => onClickSelectRoom(room.id, room.name) }
              >
                { room.name }
              </li>
            ))
          }
        </ul>
      </div>

      {
        user && (
          <div className="mb-2 p-4 text-slate-100 text-lg font-medium">
            {user.email}
          </div>
        )
      }
      
      <div 
        // クリック時に実行したい場合は必ず無名関数と記述
        // オブジェクトの状態(例えば、onClickSignOut)で渡すとマウント時に実行されてしまい、ログアウトしてしまう。
        onClick={ () => onClickSignOut() }
        className="mb-2 cursor-pointer p-4 text-slate-100 bg-slate-700 duration-150 flex items-center justify-evenly"
      >
        <BiLogOut />
        <span className="text-lg">Logout</span>
      </div>

    </div>
  )
}

export default Sidebar;