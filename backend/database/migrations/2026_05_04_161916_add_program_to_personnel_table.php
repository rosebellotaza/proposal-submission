public function up(): void
{
    Schema::table('personnel', function (Blueprint $table) {
        $table->string('program')->nullable()->after('department');
    });
}

public function down(): void
{
    Schema::table('personnel', function (Blueprint $table) {
        $table->dropColumn('program');
    });
}