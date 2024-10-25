import pytest


from aws_cdk.assertions import Template


def test_constructs_alarms_redis_initialize_redis_alarms(stack, vpc, existing_resources, config):
    from infrastructure.constructs.alarms.redis import RedisAlarms
    from infrastructure.constructs.alarms.redis import RedisAlarmsProps
    from aws_cdk.aws_ec2 import SecurityGroup
    from aws_cdk.aws_ec2 import SubnetType
    from aws_cdk.aws_elasticache import CfnSubnetGroup
    from aws_cdk.aws_elasticache import CfnCacheCluster
    security_group = SecurityGroup(
        stack,
        'TestSecurityGroup',
        vpc=existing_resources.network.vpc,
        description='Security group for Redis cluster',
        allow_all_outbound=False,
    )
    subnet_group = CfnSubnetGroup(
        stack,
        'TestCfnSubnetGroup',
        description='Subnet group for Redis cluster',
        subnet_ids=existing_resources.network.vpc.select_subnets(
            subnet_type=SubnetType.PRIVATE_ISOLATED,
        ).subnet_ids
    )
    cache_cluster = CfnCacheCluster(
        stack,
        'TestCfnCacheCluster',
        num_cache_nodes=1,
        engine='redis',
        engine_version='7.1',
        cache_node_type='cache.t4g.small',
        cache_subnet_group_name=subnet_group.ref,
        vpc_security_group_ids=[
            security_group.security_group_id,
        ]
    )
    alarms = RedisAlarms(
        stack,
        'RedisAlarms',
        props=RedisAlarmsProps(
            config=config,
            existing_resources=existing_resources,
            cache_cluster=cache_cluster,
        )
    )
    template = Template.from_stack(stack)
    template.has_resource_properties(
        'AWS::CloudWatch::Alarm',
        {
            'AlarmActions': [
                {
                    'Ref': 'TestTopic339EC197'
                }
            ],
            'ComparisonOperator': 'GreaterThanOrEqualToThreshold',
            'Dimensions': [
                {
                    'Name': 'CacheClusterId',
                    'Value': {
                        'Ref': 'TestCfnCacheCluster'
                    }
                }
            ],
            'EvaluationPeriods': 1,
            'MetricName': 'CPUUtilization',
            'Namespace': 'AWS/ElastiCache',
            'OKActions': [
                {
                    'Ref': 'TestTopic339EC197'
                }
            ],
            'Period': 300,
            'Statistic': 'Maximum',
            'Threshold': 90
        }

    )
    template.has_resource_properties(
        'AWS::CloudWatch::Alarm',
        {
            'AlarmActions': [
                {
                    'Ref': 'TestTopic339EC197'
                }
            ],
            'ComparisonOperator': 'GreaterThanOrEqualToThreshold',
            'Dimensions': [
                {
                    'Name': 'CacheClusterId',
                    'Value': {
                        'Ref': 'TestCfnCacheCluster'
                    }
                }
            ],
            'EvaluationPeriods': 1,
            'MetricName': 'EngineCPUUtilization',
            'Namespace': 'AWS/ElastiCache',
            'OKActions': [
                {
                    'Ref': 'TestTopic339EC197'
                }
            ],
            'Period': 300,
            'Statistic': 'Maximum',
            'Threshold': 90
        }
    )
    template.has_resource_properties(
        'AWS::CloudWatch::Alarm',
        {
            'AlarmActions': [
                {
                    'Ref': 'TestTopic339EC197'
                }
            ],
            'ComparisonOperator': 'GreaterThanOrEqualToThreshold',
            'Dimensions': [
                {
                    'Name': 'CacheClusterId',
                    'Value': {
                        'Ref': 'TestCfnCacheCluster'
                    }
                }
            ],
            'EvaluationPeriods': 1,
            'MetricName': 'DatabaseMemoryUsagePercentage',
            'Namespace': 'AWS/ElastiCache',
            'OKActions': [
                {
                    'Ref': 'TestTopic339EC197'
                }
            ],
            'Period': 300,
            'Statistic': 'Maximum',
            'Threshold': 90
        }
    )
    template.resource_count_is(
        'AWS::CloudWatch::Alarm',
        3
    )
