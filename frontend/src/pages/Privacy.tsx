const Privacy = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold">Privacy Policy – YouTube Learning Manager</h1>
                        <p className="text-muted-foreground">Last updated: 2025-01-31</p>
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                        <p>
                            YouTube Learning Manager ("the App") is built and maintained by Sarvesh Rajoba.
                            This Privacy Policy explains how the App handles user data.
                        </p>

                        <section className="space-y-3">
                            <h2 className="text-2xl font-semibold">Information We Collect</h2>
                            <p>The App accesses Google account information only for the following purposes:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Reading the user's YouTube playlists</li>
                                <li>Reading metadata related to videos (title, duration, thumbnails)</li>
                                <li>Storing OAuth tokens securely for login sessions</li>
                            </ul>
                            <p className="font-medium">The App does not:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Store any personal information on external servers</li>
                                <li>Share user information with third parties</li>
                                <li>Sell user data</li>
                                <li>Modify or delete user YouTube content</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-2xl font-semibold">How We Use the Information</h2>
                            <p>Information retrieved via the YouTube Data API is used only to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Display playlists and videos to the user</li>
                                <li>Generate AI-based summaries (optional)</li>
                                <li>Improve the user learning experience</li>
                            </ul>
                            <p>
                                No information is stored permanently.
                                Data remains on the user's browser or secure session.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-2xl font-semibold">User Control & Data Deletion</h2>
                            <p>Users may revoke access at any time from:</p>
                            <a
                                href="https://myaccount.google.com/permissions"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline block"
                            >
                                https://myaccount.google.com/permissions
                            </a>
                            <p>Revoking access deletes all associated session data from the App.</p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-2xl font-semibold">Third-Party Services</h2>
                            <p>The App uses:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Google OAuth 2.0</li>
                                <li>YouTube Data API v3</li>
                            </ul>
                            <p>The App complies with the YouTube API Services Terms of Service.</p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-2xl font-semibold">Contact</h2>
                            <p>If you have questions, contact:</p>
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

export default Privacy;
