
import { useState } from "react";
import api from "../services/api";

function CompleteProfilePage() {
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const normalizedPhone = phone.replace(/\s/g, "");

    const handleSubmit = (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (loading) return;

        setError("");

        if (!/^07\d{8}$/.test(normalizedPhone)) {
            setError(
                "Introdu un număr valid de telefon, de forma 07xxxxxxxx."
            );
            return;
        }

        setShowConfirmation(true);
    };

    const handleConfirmPhone = async () => {
        if (loading) return;

        setLoading(true);
        setError("");

        try {
            await api.put("/users/me/profile", {
                phone: normalizedPhone,
            });

            window.location.replace("/welcome-reward");
        } catch (err: unknown) {
            if (
                typeof err === "object" &&
                err !== null &&
                "response" in err
            ) {
                const response = (
                    err as {
                        response?: {
                            status?: number;
                            data?: { message?: string };
                        };
                    }
                ).response;

                if (response?.status === 409) {
                    setError(
                        "Acest număr de telefon este deja folosit."
                    );
                } else if (response?.status === 400) {
                    setError(
                        response.data?.message ??
                        "Numărul de telefon introdus nu este valid."
                    );
                } else if (response?.status === 401) {
                    setError(
                        "Sesiunea a expirat. Autentifică-te din nou."
                    );
                } else if (response?.status === 403) {
                    setError(
                        response.data?.message ??
                        "Nu ai permisiunea să completezi profilul. Autentifică-te din nou."
                    );
                } else {
                    setError(
                        response?.data?.message ??
                        "Numărul nu a putut fi salvat. Încearcă din nou."
                    );
                }
            } else {
                setError(
                    "Nu am putut contacta serverul. Verifică conexiunea și încearcă din nou."
                );
            }

            setShowConfirmation(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="complete-profile-page">
            <section className="complete-profile-card">
                <p className="section-eyebrow">
                    APROAPE GATA
                </p>

                <h1>
                    {showConfirmation
                        ? "Verifică numărul."
                        : "Completează profilul."}
                </h1>

                <p className="complete-profile-card__description">
                    {showConfirmation
                        ? "Asigură-te că ai introdus corect numărul de telefon. Îl vom folosi pentru a te putea contacta în legătură cu programările."
                        : "Avem nevoie de numărul tău de telefon pentru programări și pentru a putea fi contactat dacă este nevoie."}
                </p>

                {!showConfirmation ? (
                    <form
                        className="complete-profile-form"
                        onSubmit={handleSubmit}
                    >
                        <label>
                            Număr de telefon

                            <input
                                type="tel"
                                value={phone}
                                onChange={(event) =>
                                    setPhone(event.target.value)
                                }
                                placeholder="07xxxxxxxx"
                                autoComplete="tel"
                                inputMode="tel"
                                maxLength={10}
                                required
                                disabled={loading}
                            />
                        </label>

                        {error && (
                            <p className="complete-profile-form__error">
                                {error}
                            </p>
                        )}

                        <button type="submit" disabled={loading}>
                            Continuă
                        </button>
                    </form>
                ) : (
                    <div className="complete-profile-form">
                        <div className="phone-confirmation">
                            <span>NUMĂRUL INTRODUS</span>
                            <strong>{normalizedPhone}</strong>
                        </div>

                        {error && (
                            <p className="complete-profile-form__error">
                                {error}
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={handleConfirmPhone}
                            disabled={loading}
                        >
                            {loading
                                ? "Se salvează..."
                                : "Da, numărul este corect"}
                        </button>

                        <button
                            type="button"
                            className="phone-confirmation__back"
                            onClick={() => {
                                setError("");
                                setShowConfirmation(false);
                            }}
                            disabled={loading}
                        >
                            Modifică numărul
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}

export default CompleteProfilePage;
