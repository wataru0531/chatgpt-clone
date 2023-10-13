/**************************************************************

コンテキスト ... layout.tsxで使用

***************************************************************/
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";

type AppProviderProps = {
  children: React.ReactNode,
}

// React.Dispatch ... useStateフックやuseReducerフックなどで状態を更新するための関数の型を表す
// React.SetStateAction ... 状態の更新に使用できる値を表す型。状態を更新する関数に渡すことができる値を指定する
type AppContextType = {
  user: User | null, // User ... Firebaseに型がある
  setUser: React.Dispatch<React.SetStateAction<User | null>>, // useStateの更新関数の型定義
  userId: string | null,
  setUserId: React.Dispatch<React.SetStateAction<string | null>>
  selectedRoom: string | null,
  setSelectedRoom: React.Dispatch<React.SetStateAction<string | null>>,
  selectRoomName: string | null,
  setSelectRoomName: React.Dispatch<React.SetStateAction<string | null>>,
}

// このデフォルトのコンテキストは初期化時にコンテキストを初期化しない場合に使用する。エラーを防ぐためでもある。
const defaultContextData = {
  user: null,
  setUser: () => {},
  userId: null,
  setUserId: () => {},
  selectedRoom: null,
  setSelectedRoom: () => {},
  selectRoomName: null,
  setSelectRoomName: () => {},
}

// コンテキストを生成
const AppContext = createContext<AppContextType>(defaultContextData);
// 各ファイルで使えるように事前に初期化
export const useAuthUser = () => useContext(AppContext);


export const AppProvider = ({ children }: AppProviderProps) => {
  const router = useRouter();

  const [ user, setUser ] = useState<User | null>(null); // ログインしているユーザーに関するステート
  const [ userId, setUserId ] = useState<string | null>(null); // ログインしているユーザーのid
  const [ selectedRoom, setSelectedRoom ] = useState<string | null>(null); // ドキュメントのid
  const [ selectRoomName, setSelectRoomName ] = useState<string | null>(null); // ドキュメントの名前

  // ログインしているユーザー情報を取得
  useEffect(() => {
    // onAuthStateChanged ... 認証の状態が変化するたびに呼び出される。
    // 新しいユーザーオブジェクトがコールバック関数に渡される
    const unsubscribe = onAuthStateChanged(auth, (newUser) => {
      // console.log(newUser); // UserImpl{...uidなど}

      setUser(newUser); // ログインしているユーザーオブジェクトを保持
      setUserId(newUser ? newUser.uid : null); // ログインしているユーザーのidを保持
    });

    // console.log(user);

    // userがが登録されていない場合ログインページへ
    if(!user){
      router.push("/auth/login");
    }

    // クリーンアップ関数
    // useEffectフック内でunsubscribe()を返すことで、コンポーネントがアンマウントされたときにこの関数が実行され、
    // onAuthStateChangedリスナーが解除される。
    // これにより、アンマウントされたコンポーネントがリスナーを保持しなくなり、メモリリークを防ぐことができる
    return () => {
      unsubscribe();
    }
  }, []);

  return(
    <AppContext.Provider 
      value={{ user, setUser, userId, setUserId, selectedRoom, setSelectedRoom, selectRoomName, setSelectRoomName }}
    >
      { children }
    </AppContext.Provider>
  )
}

