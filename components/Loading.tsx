import { JSX } from "preact";

export const Loading = () => (
  <div class="flex space-x-[3px] justify-center items-center">
    <div
      class="h-[6px] w-[6px] bg-[var(--primary-color)] rounded-full animate-bounce"
      style={{ animationDelay: "-0.3s" }}
    />
    <div
      class="h-[6px] w-[6px] bg-[var(--primary-color)] rounded-full animate-bounce"
      style={{ animationDelay: "-0.15s" }}
    />
    <div class="h-[6px] w-[6px] bg-[var(--primary-color)] rounded-full animate-bounce" />
  </div>
);

interface LoadingWrapperProps {
  children: JSX.Element;
}

export const LoadingWrapper = ({ children }: LoadingWrapperProps) => (
  <div class="flex justify-center items-center">
    {children}
    <Loading />
  </div>
);
