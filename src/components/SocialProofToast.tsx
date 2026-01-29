import { useState, useEffect } from "react"
import { ShieldCheck, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const NOTIFICATIONS = [
    { name: "Luis G.", city: "Cusco", action: "verificó su identidad", time: "Hace 1 min" },
    { name: "María R.", city: "Lima", action: "activó su widget", time: "Hace 2 min" },
    { name: "Carlos P.", city: "Arequipa", action: "recibió 3 leads", time: "Hace 5 min" },
    { name: "Ana Torres", city: "Trujillo", action: "comenzó prueba gratis", time: "Hace 30 seg" },
    { name: "Jorge M.", city: "Piura", action: "conectó su WhatsApp", time: "Hace 10 min" },
]

export function SocialProofToast() {
    const [isVisible, setIsVisible] = useState(false)
    const [currentNotification, setCurrentNotification] = useState(0)

    useEffect(() => {
        // Start delay
        const initialTimer = setTimeout(() => setIsVisible(true), 3000)

        // Cycle notifications
        const interval = setInterval(() => {
            setIsVisible(false) // Hide

            setTimeout(() => {
                // Change content and show
                setCurrentNotification(prev => (prev + 1) % NOTIFICATIONS.length)
                setIsVisible(true)
            }, 500) // Wait for fade out

        }, 8000) // Every 8 seconds

        return () => {
            clearTimeout(initialTimer)
            clearInterval(interval)
        }
    }, [])

    const data = NOTIFICATIONS[currentNotification]

    return (
        <div
            className={cn(
                "fixed bottom-4 left-4 z-50 transition-all duration-500 transform",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            )}
        >
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 text-slate-100 p-3 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px] max-w-sm">

                {/* Icon Badge */}
                <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-slate-900">
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                    </div>
                </div>

                {/* Content */}
                <div>
                    <p className="text-sm font-medium">
                        <span className="font-bold text-white">{data.name}</span> <span className="text-slate-400">de {data.city}</span>
                    </p>
                    <p className="text-sm font-semibold text-emerald-300">
                        {data.action}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">
                        Verificado • {data.time}
                    </p>
                </div>
            </div>
        </div>
    )
}
