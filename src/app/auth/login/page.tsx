/**************************************************************

ログインページ

***************************************************************/
"use client";

import Link from "next/link"
import { useRouter } from "next/navigation";
import { Metadata } from "next";
import { SubmitHandler, useForm } from "react-hook-form";
import { auth  } from "../../../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

// headタグ ... クライアントでは使えないかも....Todo 動的に使えるmetadataがある?
// export const metadata: Metadata = {
//   title: 'ChatGPT clone | 新規登録画面',
//   description: 'react-hook-form',
// }

type Inputs = {
  email: string,
  password: string,
}

const Login = () => {
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

    // ユーザーのemailとpasswordを使いログイン
    await signInWithEmailAndPassword(auth, data.email, data.password).then(userCredential => {
      const user = userCredential.user;

      router.push("/");
    }).catch(error => {
      // console.log(error);
      const errorCode = error.code;
      const errorMessage = error.message;
      // console.log(errorCode); // auth/invalid-login-credentials
      // console.log(errorMessage); // Firebase: Error (auth/invalid-login-credentials).

      if(error.code === "auth/invalid-login-credentials"){
        alert("そのようなユーザーは存在しません");
      }else{
        alert(errorMessage);
      }
    })

  }

  return(
    <div className="h-screen flex flex-col items-center justify-center">

      <form
        onSubmit={ handleSubmit(onSubmit) }
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h1 className="mb-4 text-2xl text-gray-700 font-medium">Login</h1>
        
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
              pattern: { // メールアドレスの形態ではない場合はエラーとする
                value: /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/,
                message: "不適切なメールアドレスです"
              }
            })}
          />
          { 
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
                message: "パスワードを入力してください"
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
          <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-400">Login</button>
        </div>

        <div className="mt-4">
          <span className="text-gray-600 text-sm">初めてのご利用の方はこちら</span>
          <Link
            href="/auth/register"
            className="text-blue-500 text-sm font-bold ml-1 hover:text-blue-400"
          >新規登録ページへ
          </Link>
        </div>


      </form>
      
    </div>
  )
}

export default Login;