import { ModalProps } from "@/types/modal"

const Modal = ({ title, description, children, onClose }: ModalProps) => {
  return (
    <div  role="dialog" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-sm text-slate-400">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-slate-400 transition hover:text-white"
          >
            Close
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}

export default Modal