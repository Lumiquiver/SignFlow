export default function Footer() {
  return (
    <footer className="bg-[#F1F3F4] mt-8 py-6 border-t border-[#DADCE0]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600">© 2023 Sign Language Translator</p>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-gray-600 hover:text-primary">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-600 hover:text-primary">Terms of Service</a>
            <a href="#" className="text-sm text-gray-600 hover:text-primary">About</a>
            <a href="#" className="text-sm text-gray-600 hover:text-primary">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
