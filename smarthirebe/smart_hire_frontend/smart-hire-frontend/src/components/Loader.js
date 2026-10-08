export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex items-center justify-center p-6">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mr-3"></div>
      <div className="text-gray-600">{text}</div>
    </div>
  );
}
