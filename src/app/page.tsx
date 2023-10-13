/**************************************************************

ルートディレクトリ

注) Open AIは課金が必要なため返しのメッセージ機能は実装しない

***************************************************************/
"use client";

import Sidebar from './components/Sidebar'
import Chat from './components/Chat';


export default function Home() {

  // routerにはlocationというオブジェクトが使われているのでビルドのタイミング
  // でエラーが出る。→ サーバーサイドにはlocationオブジェクトは存在しないため
  // useEffect(() => {
  //   if(!user){
  //     router.push("/auth/login");
  //   }
  // }, [])

  return (
    <div className="flex h-screen justify-center items-center">
      <div className="h-full flex" style={{ width: "1280px" }}>

        <div className="w-1/5 h-full border-r">
          <Sidebar />
        </div>
        <div className="w-4/5 h-full ">
          <Chat />
        </div>

      </div>
    </div>
  )
}

