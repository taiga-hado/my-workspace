import ChatPanel from "@/components/ChatPanel";

export default function ChatPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">AI素材検索</h1>
        <p className="text-sm text-gray-500 mt-1">
          欲しい素材のイメージを自然な言葉で伝えてください
        </p>
      </div>
      <ChatPanel />
    </div>
  );
}
