import { Global, Module } from "@nestjs/common";
import { AUTH_PROVIDER } from "./auth-provider.interface";
import { NoAuthProvider } from "./no-auth.provider";
import { AuthGuard } from "./auth.guard";

@Global()
@Module({
  providers: [NoAuthProvider, AuthGuard, { provide: AUTH_PROVIDER, useExisting: NoAuthProvider }],
  exports: [AUTH_PROVIDER, AuthGuard],
})
export class AuthModule {}
