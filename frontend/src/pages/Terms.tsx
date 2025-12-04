const Terms = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold">Terms of Service – YouTube Learning Manager</h1>
                        <p className="text-muted-foreground">Last updated: 2025-01-31</p>
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                        <p>
                            By using YouTube Learning Manager ("the App"), you agree to the following terms.
                        </p>

                        <section className="space-y-3">
                            <h2 className="text-2xl font-semibold">1. Use of the App</h2>
                            <p>
                                The App allows users to log in with Google and access their YouTube playlists for learning purposes.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-2xl font-semibold">2. API Usage</h2>
                            <p>The App uses Google's OAuth 2.0 and the YouTube Data API in compliance with:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Google API Terms of Service</li>
                                <li>YouTube API Services Terms of Service</li>
                            </ul>
                            <p>The App does not perform actions such as modifying or deleting any user content.</p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-2xl font-semibold">3. No Warranty</h2>
                            <p>
                                The App is provided "as is."
                                No guarantees are given regarding uptime or performance.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-2xl font-semibold">4. Termination</h2>
                            <p>Users may revoke access at any time from:</p>
                            <a
                                href="https://myaccount.google.com/permissions"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline block"
                            >
                                https://myaccount.google.com/permissions
                            </a>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-2xl font-semibold">5. Contact</h2>
                            <p>For questions:</p>
                            <a
                                href="mailto:sarveshrajoba10@gmail.com"
                                className="text-blue-600 hover:underline"
                            >
                                sarveshrajoba10@gmail.com
                            </a>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Terms;
