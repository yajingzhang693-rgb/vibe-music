/** 页面转场放在各页组件内；template 保持轻量，避免 dev 下 chunk/HMR 异常 */
export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
