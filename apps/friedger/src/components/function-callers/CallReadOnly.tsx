import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { ContractFn } from "../../util/stacks-types"
import ArgParse from "./ArgParse"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { queries } from "../../stacks-api/queries"
import { userSession } from "../../user-session"
import {
  ClarityValue,
  cvToHex,
  cvToString,
  hexToCV,
} from "@stacks/transactions"
import { asciiRegex } from "../../util/checkValidAscii"

export default function CallReadOnlyFn({
  fn,
  contractName,
}: {
  fn: ContractFn
  contractName: string
}) {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<{
    [x: string]: ClarityValue
  }>()
  const [address, name] = useMemo(
    () => contractName.split(".") as [string, string],
    [contractName],
  )
  const sender = useMemo(() => {
    return userSession.loadUserData().profile.stxAddress.mainnet as string
  }, [])
  const [args, setArgs] = useState<string[]>([])
  const { data } = useQuery({
    ...queries.contracts.readOnly({
      address,
      name,
      fnName: fn.name,
      sender,
      args,
    }),
    enabled: fn.args.length === args.length,
    retry: false,
  })

  useEffect(() => {
    setArgs([])
  }, [fn.name])

  const onSubmit: SubmitHandler<{ [x: number]: ClarityValue }> = useCallback(
    (values) => {
      const stringifiedArgs = Object.values(values).map((item) => cvToHex(item))
      setArgs(stringifiedArgs)
    },
    [],
  )
  console.log({ errors, isValid })

  return (
    <form
      className="flex flex-col gap-y-4 w-full"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h3 className="text-lg font-bold">{fn.name}</h3>
      {fn.args.map((arg, index) => (
        <Controller
          name={String(index)}
          control={control}
          rules={{ required: true, pattern: asciiRegex }}
          key={`${fn.name}.${arg.name}`}
          render={({ field }) => (
            <ArgParse arg={arg} onChange={field.onChange} value={field.value} />
          )}
        />
      ))}

      {!!fn.args.length && <button type="submit">Call</button>}
      <p>{data?.result && cvToString(hexToCV(data.result))}</p>
    </form>
  )
}