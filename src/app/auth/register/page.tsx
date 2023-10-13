/**************************************************************

新規登録画面

***************************************************************/
"use client";

import Link from "next/link"
import { useRouter } from "next/navigation";
import { Metadata } from "next";
import { SubmitHandler, useForm } from "react-hook-form";
import { auth  } from "../../../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

// headタグ ... クライアントでは使えないかも...
// export const metadata: Metadata = {
//   title: 'ChatGPT clone | 新規登録画面',
//   description: 'react-hook-form',
// }

type Inputs = {
  email: string,
  password: string,
}

const Register = () => {
  const router = useRouter();

  // react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },

  } = useForm<Inputs>({
    // 発火の条件など
  })

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    // console.log(data); // {email: '0531@gmail.com', password: 'aaaa'}

    // ユーザーのemailとpasswordをFirebase Authentificationに登録
    await createUserWithEmailAndPassword(auth, data.email, data.password).then(userCredential => {
      const user = userCredential.user;
      // console.log(user); // 

      router.push("/auth/login");

    }).catch(error => {
      // Firebase Authentificationでは同じメールアドレスでは登録できないのでエラーがでる
      // alert(error)
      const errorCode = error.code;
      const errorMessage = error.message;
      // console.log(errorCode); // auth/email-already-in-use
      // console.log(errorMessage); // Firebase: Error (auth/email-already-in-use).

      if(error.code === "auth/email-already-in-use"){
        alert("このメールアドレスは既に使われています")
      } else {
        alert(errorCode);
      }

    })
  }

  return(
    <div className="h-screen flex flex-col items-center justify-center">

      <form
        onSubmit={ handleSubmit(onSubmit) }
        className="bg-white p-8 rounded-lg shadow- md w-96"
      >
        <h1 className="mb-4 text-2xl text-gray-700 font-medium">新規登録</h1>

        <div className="mb-4">
          <label htmlFor="" className="block text-sm font-medium text-gray-600">Email</label>
          <input 
            className="mt-1 border-2 rounded-md w-full p-2" 
            type="text" 
            placeholder="◯◯◯@gmail.com"
            {...register("email", {
              required: { // バリデーション
                value: true,
                message: "メールアドレスを入力してください"
              },
              pattern: { // メールアドレスの形式ではない場合はエラーとする
                value: /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/,
                message: "不適切なメールアドレスです"
              }
            })}
          />
          { 
            // バリデーションでエラーがあった場合は、errorsオブジェクトに格納される
            errors.email && (
              <span className="text-red-600">{ errors.email?.message }</span>
            )
          }
        </div>
        
        <div>
          <label htmlFor="">Password</label>
          <input 
            className="mt-1 border-2 rounded-md w-full p-2" 
            type="password" 
            {...register("password", {
              required: {
                value: true,
                message: "メールアドレスを入力してください"
              },
              minLength: {
                value: 6,
                message: "6文字以上入力してください"
              }
            })

            }
          />
          { 
            errors.password && (
              <span className="text-red-600">{ errors.password?.message }</span>
            )
          }
        </div>

        <div className="mt-5 flex justify-end">
          <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-400">新規登録</button>
        </div>
        <div className="mt-4">
          <span className="text-gray-600 text-sm">既にアカウントをお持ちですか?</span>
          <Link
            href="/auth/login"
            className="text-blue-500 text-sm font-bold ml-1 hover:text-blue-400"
          >ログインページへ
          </Link>
        </div>

      </form>
      
    </div>
  )
}

export default Register;