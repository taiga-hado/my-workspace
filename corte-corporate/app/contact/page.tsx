"use client";

import { useState } from "react";
import PageHero from "@/components/PageHero";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <PageHero en="Contact" jp="お問い合わせ" />

      <section className="py-20 md:py-28">
        <div className="container-max max-w-2xl">
          <p className="text-navy-800 leading-loose">
            取材・協業・採用・その他のお問い合わせは、下記フォームよりご連絡ください。
            通常2〜3営業日以内にご返信いたします。
          </p>

          {submitted ? (
            <div className="mt-12 border border-navy-200 bg-navy-50 p-10 text-center">
              <div className="font-serif text-2xl font-semibold text-navy-900">
                お問い合わせを受け付けました
              </div>
              <p className="mt-4 text-sm text-navy-800">
                内容を確認の上、担当者よりご返信いたします。
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-12 space-y-8">
              <Field label="お名前" required>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="山田 太郎"
                />
              </Field>
              <Field label="会社名・団体名">
                <input type="text" className="input" />
              </Field>
              <Field label="メールアドレス" required>
                <input
                  type="email"
                  required
                  className="input"
                  placeholder="example@corte.co.jp"
                />
              </Field>
              <Field label="お問い合わせ種別" required>
                <select required className="input" defaultValue="">
                  <option value="" disabled>
                    選択してください
                  </option>
                  <option>取材・メディア</option>
                  <option>協業・業務提携</option>
                  <option>採用について</option>
                  <option>サービスについて</option>
                  <option>その他</option>
                </select>
              </Field>
              <Field label="お問い合わせ内容" required>
                <textarea required rows={6} className="input" />
              </Field>

              <div className="pt-4 text-center">
                <button type="submit" className="btn-primary">
                  送信する
                </button>
                <p className="mt-4 text-xs text-navy-500">
                  ※ ご入力いただいた個人情報は、お問い合わせ対応のみに利用いたします。
                </p>
              </div>
            </form>
          )}
        </div>
      </section>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid #c5cfe3;
          background: #fff;
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
          color: #0f1b33;
          transition: border-color 0.15s;
        }
        .input:focus {
          outline: none;
          border-color: #22345a;
        }
      `}</style>
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-navy-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
