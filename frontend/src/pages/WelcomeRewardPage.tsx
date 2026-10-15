import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

type WelcomeRewardType =
    | "NOTHING"
    | "POWDER"
    | "DISCOUNT_10"
    | "DISCOUNT_25"
    | "DISCOUNT_50"
    | "CASH_50"
    | "CASH_100"
    | "FREE_HAIRCUT";

interface WelcomeRewardStatusResponse {
    spinAvailable: boolean;
    reward: WelcomeRewardType | null;
    label: string | null;
}

interface WelcomeRewardResponse {
    reward: WelcomeRewardType;
    label: string;
}

interface WheelSegment {
    reward: WelcomeRewardType;
    label: string;
}

const segments: WheelSegment[] = [
    { reward: "NOTHING", label: "Nimic" },
    { reward: "DISCOUNT_10", label: "10% reducere" },
    { reward: "CASH_50", label: "50 lei" },
    { reward: "DISCOUNT_25", label: "25% reducere" },
    { reward: "POWDER", label: "O pudră" },
    { reward: "FREE_HAIRCUT", label: "Un tuns" },
    { reward: "CASH_100", label: "100 lei" },
    { reward: "DISCOUNT_50", label: "50% reducere" },
];

function WelcomeRewardPage() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [animateRotation, setAnimateRotation] = useState(false);
    const [result, setResult] =
        useState<WelcomeRewardResponse | null>(null);
    const [error, setError] = useState("");

    const pendingResult = useRef<WelcomeRewardResponse | null>(null);
    const activeSpin = useRef(false);
    const rotationRef = useRef(0);
    const fallbackTimer = useRef<number | null>(null);
    const animationFrameOne = useRef<number | null>(null);
    const animationFrameTwo = useRef<number | null>(null);

    useEffect(() => {
        let active = true;

        const loadStatus = async () => {
            try {
                const response =
                    await api.get<WelcomeRewardStatusResponse>(
                        "/rewards/me"
                    );

                if (!active) return;

                if (!response.data.spinAvailable) {
                    navigate("/programare", { replace: true });
                }
            } catch {
                if (active) {
                    setError("Roata nu a putut fi încărcată.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadStatus();

        return () => {
            active = false;

            if (fallbackTimer.current !== null) {
                window.clearTimeout(fallbackTimer.current);
            }

            if (animationFrameOne.current !== null) {
                window.cancelAnimationFrame(animationFrameOne.current);
            }

            if (animationFrameTwo.current !== null) {
                window.cancelAnimationFrame(animationFrameTwo.current);
            }
        };
    }, [navigate]);

    const finishSpin = () => {
        if (!activeSpin.current || !pendingResult.current) return;

        if (fallbackTimer.current !== null) {
            window.clearTimeout(fallbackTimer.current);
            fallbackTimer.current = null;
        }

        setResult(pendingResult.current);
        pendingResult.current = null;
        activeSpin.current = false;
        setSpinning(false);
    };

    const handleSpin = async () => {
        if (activeSpin.current || result) return;

        activeSpin.current = true;
        setSpinning(true);
        setError("");
        pendingResult.current = null;

        if (fallbackTimer.current !== null) {
            window.clearTimeout(fallbackTimer.current);
            fallbackTimer.current = null;
        }

        try {
            const response =
                await api.post<WelcomeRewardResponse>(
                    "/rewards/spin"
                );

            const segmentIndex = segments.findIndex(
                (segment) => segment.reward === response.data.reward
            );

            if (segmentIndex === -1) {
                throw new Error("Reward segment not found");
            }

            pendingResult.current = response.data;

            const segmentAngle = 360 / segments.length;
            const segmentCenter =
                segmentIndex * segmentAngle + segmentAngle / 2;

            const currentAngle =
                ((rotationRef.current % 360) + 360) % 360;

            const desiredAngle =
                ((360 - segmentCenter) % 360 + 360) % 360;

            const extraAngle =
                (desiredAngle - currentAngle + 360) % 360;

            const nextRotation =
                rotationRef.current + 360 * 8 + extraAngle;

            setAnimateRotation(false);
            setRotation(rotationRef.current);

            animationFrameOne.current =
                window.requestAnimationFrame(() => {
                    animationFrameTwo.current =
                        window.requestAnimationFrame(() => {
                            rotationRef.current = nextRotation;
                            setAnimateRotation(true);
                            setRotation(nextRotation);
                        });
                });

            fallbackTimer.current = window.setTimeout(() => {
                finishSpin();
            }, 6500);
        } catch {
            pendingResult.current = null;
            activeSpin.current = false;
            setSpinning(false);
            setError(
                "Roata nu a putut fi învârtită. Încearcă din nou."
            );
        }
    };

    const handleWheelTransitionEnd = (
        event: React.TransitionEvent<HTMLDivElement>
    ) => {
        if (
            event.target !== event.currentTarget ||
            event.propertyName !== "transform"
        ) {
            return;
        }

        finishSpin();
    };

    const handleContinue = () => {
        navigate("/programare", { replace: true });
    };

    if (loading) {
        return (
            <main className="reward-page">
                <p className="reward-page__loading">
                    Se pregătește surpriza...
                </p>
            </main>
        );
    }

    return (
        <main className="reward-page">
            <section className="reward-card">
                <div className="reward-card__intro">
                    <p className="section-eyebrow">
                        BUN VENIT LA GLOBAL BARBER SOCIETY
                    </p>

                    <h1>Învârte roata.</h1>

                    <p>
                        Cont nou, o singură șansă.
                        Învârte roata și vezi ce ai câștigat.
                    </p>
                </div>

                <div className="reward-wheel-wrapper">
                    <div className="reward-wheel__pointer" />

                    <div
                        className="reward-wheel"
                        onTransitionEnd={handleWheelTransitionEnd}
                        style={{
                            transform: `rotate(${rotation}deg)`,
                            transition: animateRotation
                                ? "transform 5.5s cubic-bezier(0.12, 0.72, 0.12, 1)"
                                : "none",
                        }}
                    >
                        {segments.map((segment, index) => {
                            const angle =
                                index * (360 / segments.length) +
                                360 / segments.length / 2;

                            return (
                                <div
                                    key={segment.reward}
                                    className="reward-wheel__label"
                                    style={{
                                        transform: `
                                            rotate(${angle}deg)
                                            translateY(-34cqw)
                                            rotate(${-angle}deg)
                                        `,
                                    }}
                                >
                                    {segment.label}
                                </div>
                            );
                        })}

                        <div className="reward-wheel__center">
                            GBS
                        </div>
                    </div>
                </div>

                {error && (
                    <p className="reward-error" role="alert">
                        {error}
                    </p>
                )}

                {!result && (
                    <button
                        type="button"
                        className="reward-spin-button"
                        onClick={handleSpin}
                        disabled={spinning}
                    >
                        {spinning
                            ? "Se învârte..."
                            : "ÎNVÂRTE ROATA"}
                    </button>
                )}

                {result && (
                    <div className="reward-result">
                        <p>AI CÂȘTIGAT</p>

                        <h2>{result.label}</h2>

                        <span>
                            Premiul a fost salvat în contul tău.
                        </span>

                        <button
                            type="button"
                            onClick={handleContinue}
                        >
                            Continuă la programare
                        </button>
                    </div>
                )}

                <p className="reward-card__notice">
                    Roata poate fi învârtită o singură dată pentru fiecare cont.
                </p>
            </section>
        </main>
    );
}

export default WelcomeRewardPage;
